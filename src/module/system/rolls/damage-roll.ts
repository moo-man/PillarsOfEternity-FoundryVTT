import { TokenDataProperties } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/tokenData';
import { ConsolidatedDamage, DamageRollData, DamageTarget, DamageTermOptions, DamageTermToolTip, DialogDamage, DialogHealing } from '../../../types/checks';
import { Defense } from '../../../types/common';
import { PILLARS } from '../config';
import { getGame } from '../utility';
import SkillCheck from './skill-check';

export default class DamageRoll {
  data: DamageRollData;
  damages: ConsolidatedDamage[];

  constructor(damages?: (DialogDamage & DialogHealing)[], check?: SkillCheck) {
    if (damages && check) {
      this.data = {
        damages: damages,
        checkId: check?.message?.id!,
        damageData: [],
        rollMessageIds: [],
        healing: damages?.some((d) => d.healing),
        usingShield: [], // index of target using shields
      };
      this.damages = this.consolidateDamages(damages);
    } else {
      this.data = <DamageRollData>{};
      this.damages = [];
    }
  }

  async rollDice() {
    await this.rollDamages();
    return this.sendToChat();
  }

  static recreate(data: DamageRollData) {
    let roll = new this();
    roll.data = data;
    roll.damages = roll.consolidateDamages(roll.data.damages);
    return roll;
  }

  /**
   * Combine like damages (damage shouldn't be rerolled for different targets of the same damage source)
   * Damages are combined if they have the same base dice, crit dice, and label
   * Targets for each damage are combined into an array of objects containing the token and a number indicating the crit
   *
   * @param {Array} damages   damage objects
   */
  consolidateDamages(damages: (DialogDamage & DialogHealing)[]) {
    let consolidatedList: ConsolidatedDamage[] = [];

    for (let damage of damages) {
      // Need to convert DialogDamage into ConsolidatedDamage, but "target" is incompatible
      let consolidated: ConsolidatedDamage = <ConsolidatedDamage>(<Omit<DialogDamage, 'target'>>damage);

      if (!Array.isArray(damage.target)) {
        consolidated.target = [this.calculateCrit(damage.target as TokenDocument, damage)];
      }

      let existing;
      if (damage.healing) existing = consolidatedList.find((d) => d.value == damage.value && d.type == damage.type);
      else existing = consolidatedList.find((d) => d.base == damage.base && d.crit == damage.crit && d.label == damage.label);

      if (existing) {
        // Consolidated damage should have the highest multiplier
        if ((damage.mult || 0) > (existing.mult || 0)) existing.mult = damage.mult;

        if (damage.target) {
          existing.target = existing.target?.concat(consolidated.target);
        }
      } else {
        consolidatedList.push(consolidated);
      }
    }

    consolidatedList.forEach((damage) => {
      damage.target = damage.target.filter((t) => t.token);
      damage.target = damage.target.sort((a, b) => a.crit - b.crit);
    });
    return consolidatedList;
  }

  calculateCrit(token: TokenDocument, damage: DialogDamage): DamageTarget {
    try {
      if (token.actor?.data.type == "headquarters")
        throw new Error("Cannot calculate crit against headquarter type actors")
      if (!token || damage.healing || !token.actor) return { token: <TokenDataProperties>token?.toObject(), crit: 0 };
      let defense: Defense = <Defense>damage.defense.toLowerCase() || 'deflection';
      let margin = (this.check?.result?.total || 0) - token.actor!.system.defenses![defense]!.value!;
      let crit = Number.isNumeric(damage.mult) ? damage.mult || 0 : Math.floor(margin / 5);
      return { token: <TokenDataProperties>token.toObject(), crit, shield: !!token.actor.equippedShield };
    } catch (e) {
      console.error(getGame().i18n.localize("PILLARS.ErrorCalculatingCrit"), token, damage);
      return { token: null, crit: 0 };
    }
  }

  async rollDamages() {
    let game = getGame();
    for (let i = 0; i < this.damages.length; i++) {
      let damage = this.damages[i];
      let baseDice: (Die | NumericTerm | OperatorTerm)[] = [];
      let critDice: (Die | OperatorTerm)[] = [];

      if (damage) {
        if (!damage.healing) {
          let multiplier = damage.mult || 0;
          baseDice = [
            new Die({
              number: parseInt(damage.base.split('d')[0] || ''),
              faces: parseInt(damage.base.split('d')[1] || ''),
              options: <DamageTermOptions>{ flavor: game.i18n.localize("PILLARS.Hit"), crit: 'base', targets: damage.target.filter((t) => t.crit == 0) },
            }),
          ];
          for (let i = 0; i < multiplier; i++) {
            critDice.push(new OperatorTerm({ operator: '+' }));
            critDice.push(
              new Die({
                number: parseInt(damage.crit.split('d')[0] || ''),
                faces: parseInt(damage.crit.split('d')[1] || ''),
                options: <DamageTermOptions>{ flavor: `${i + 1}x ${game.i18n.localize("PILLARS.Crit")}`, crit: i + 1, targets: damage.target.filter((t) => t.crit == i + 1) },
              })
            );
          }
        } // If healing
        else {
          if (!Number.isNumeric(damage.value))
            // Is die roll
            baseDice = [
              new Die({
                number: parseInt(damage.value?.split('d')[0] || ''),
                faces: parseInt(damage.value?.split('d')[1] || ''),
                options: <DamageTermOptions>{ flavor: game.i18n.localize("PILLARS.Heal"), crit: 'base', targets: damage.target.filter((t) => t.crit == 0) },
              }),
            ];
          else
            baseDice = [
              new NumericTerm({
                number: parseInt(damage.value || ''),
                options: <DamageTermOptions>{ flavor: game.i18n.localize("PILLARS.Heal"), crit: 'base', targets: damage.target.filter((t) => t.crit == 0) },
              }),
            ];
        }

        let dice = baseDice.concat(critDice);
        let roll = Roll.fromTerms(dice);
        await roll.evaluate({ async: true });

        let accumulatingTotal = 0;
        roll.dice.forEach((die) => {
          accumulatingTotal += parseInt(die.total?.toString() || '0');
          (<DamageTermOptions>die.options).accumulator = accumulatingTotal;
        });

        damage.parts = roll.dice.map((d) => {
          let data = <DamageTermToolTip>d.getTooltipData();
          data.options = d.options as DamageTermOptions;
          return data;
        });

        damage.roll = roll;
      }
    }
  }

  toggleShield(id: string) {
    if (!canvas?.tokens?.get(id)?.actor?.isOwner) return;

    for (let message of this.damageMessages) {
      if (message) {
        let html = $(message.data.content);
        let shield = html.find(`.shield[data-id="${id}"]`)[0];
        let game = getGame();
        if (shield) {
          if (shield.classList.contains('active')) {
            this.data.usingShield = this.data.usingShield.filter((_id) => _id != id);
            shield.classList.remove('active');
          } else {
            this.data.usingShield.push(id);
            shield.classList.add('active');
          }

          let update = { content: html[0]?.outerHTML, 'flags.pillars-of-eternity.damageData': this.data };

          if (game.user?.isGM) return message.update(update);
          else game.socket?.emit('system.pillars-of-eternity', { type: 'updateMessage', payload: { id: message.id, update } });
        }
      }
    }
  }

  async sendToChat(newMessage = false) {
    let game = getGame();
    this.damages.forEach(async (damage, i) => {
      let type = PILLARS.damageTypes[damage.type as keyof typeof PILLARS.damageTypes];
      let label = game.i18n.localize("PILLARS.Damage");
      if (damage.healing) {
        type = damage.type[0]?.toUpperCase() + damage.type.substr(1);
        label = game.i18n.localize("PILLARS.Healing");
      }

      let html = await renderTemplate('systems/pillars-of-eternity/templates/chat/damage.hbs', damage);

      let chatData = {
        // TODO: Test this
        flavor: damage.label ? `${damage.label} ${label} - ${type}` : `${this.item?.name} ${label} ${this.damages.length > 1 ? i + 1 : ''} - ${type}`,
        speaker: this.item?.actor?.speakerData(),
        content: html,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        roll: damage.roll,
        flags: { 'pillars-of-eternity.damageData': this.data, 'pillars-of-eternity.damageIndex': i },
      };
      return ChatMessage.create(chatData).then((msg) => {
        this.data.rollMessageIds.push(msg!.id);
        msg!.update({ 'flags.pillars-of-eternity.damageData.rollMessageIds': duplicate(this.data.rollMessageIds) });
      });
    });
  }

  async applyDamage(index: number) {
    let html = ``;
    let damage = this.damages[index];
    if (damage) {
      for (let part of damage.parts) {
        for (let target of (<DamageTermOptions>part.options).targets) {
          let token = canvas?.tokens?.get(target?.token?._id || '');
          if (token && token.actor) {
            let msg = await token.actor.applyDamage(part.options.accumulator || 0, damage.type, { shield: this.data.usingShield.includes(token.id) });
            html += `<b>${token.name}</b> : ${msg}<br><br>`;
          }
        }
      }
      ChatMessage.create({ content: html });
    }
  }

  async applyHealing(index: number) {
    let html = ``;
    let damage = this.damages[index];
    if (damage) {
      for (let target of damage.target) {
        let token = canvas?.tokens?.get(target.token?._id || '');
        if (token) {
          let msg = await token.actor?.applyHealing(damage.roll.total || 0, damage.type);
          html += `<b>${token.name}</b> : ${msg}<br><br>`;
        }
      }
      ChatMessage.create({ content: html });
    }
  }

  get check() {
    return getGame().messages!.get(this.data.checkId)?.getCheck();
  }

  get damageMessages() {
    return this.data.rollMessageIds.map((id) => getGame().messages!.get(id));
  }

  get checkMessage() {
    return this.check?.message;
  }

  get item() {
    return this.check?.item;
  }
}
