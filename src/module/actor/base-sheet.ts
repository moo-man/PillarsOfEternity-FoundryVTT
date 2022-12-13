import { PowerGroups } from "../../types/powers";
import { getGame } from "../system/utility";

export class BasePillarsActorSheet<Options extends ActorSheet.Options = ActorSheet.Options, Data extends object = ActorSheet.Data<Options>> extends ActorSheet<Options, Data> {

  /* -------------------------------------------- */
  /** @override */
  activateListeners(html: JQuery<HTMLElement>): void {

    html.find('.item-edit').on('click', this._onItemEdit.bind(this));
    html.find('.item-delete').on('click', this._onItemDelete.bind(this));
    html.find('.item-create').on('click', this._onItemCreate.bind(this));
    html.find('.item-post').on('click', this._onPostItem.bind(this));
    html.find('.effect-create').on('click', this._onEffectCreate.bind(this));
    html.find('.effect-edit').on('click', this._onEffectEdit.bind(this));
    html.find('.effect-delete').on('click', this._onEffectDelete.bind(this));
    html.find('.effect-toggle').on('click', this._onEffectToggle.bind(this));
    html.find('.item-dropdown.item-control').on('mouseup', this._onDropdown.bind(this));
    html.find('.item-dropdown h4').on('mouseup', this._onDropdown.bind(this));
    html.find('.item-dropdown-alt h4').on('mouseup', this._onDropdownAlt.bind(this));
  }

  _onDrop(event: DragEvent) {
    try {
      let dragData = JSON.parse(event.dataTransfer?.getData('text/plain') || '');
      if (dragData.type == 'item') this.actor.createEmbeddedDocuments('Item', [dragData.payload]);
      else super._onDrop(event);
    } catch (e) {
      super._onDrop(event);
    }
  }

  _onItemEdit(event: JQuery.ClickEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    if (itemId) return this.actor.items.get(itemId)?.sheet?.render(true);
  }
  _onItemDelete(event: JQuery.ClickEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    if (!itemId) return;
    let game = getGame();

    Dialog.confirm({
      title: game.i18n.localize("PILLARS.DeleteItem"),
      content: `<p>${game.i18n.localize("PILLARS.DeleteConfirmation")}</p>`,
      yes: () => {this.actor.deleteEmbeddedDocuments('Item', [itemId!])},
      no: () => {},
      defaultYes: true
    })
  }
  _onItemCreate(event: JQuery.ClickEvent) {
    let type = $(event.currentTarget!).attr('data-type');
    let category = $(event.currentTarget!).attr('data-category');
    let createData: Record<string, unknown> = { name: `New ${getGame().i18n.localize(CONFIG.Item.typeLabels[type!]!)}`, type };
    if (type == 'power') createData['data.improvised.value'] = true;

    if (category) createData['data.category.value'] = category;
    return this.actor.createEmbeddedDocuments('Item', [createData]);
  }

  _onPostItem(event: JQuery.ClickEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    if (itemId) return this.actor.items.get(itemId)?.postToChat();
  }

  async _onEffectCreate(ev: JQuery.ClickEvent) {
    let type = (<HTMLElement>ev.currentTarget).dataset['type'];
    let effectData: Record<string, unknown> = { label: getGame().i18n.localize("PILLARS.NewEffect"), icon: 'icons/svg/aura.svg' };
    if (type == 'temporary') {
      effectData['duration.rounds'] = 1;
    }

    let html = await renderTemplate('systems/pillars-of-eternity/templates/apps/quick-effect.html', effectData);
    new Dialog({
      title: getGame().i18n.localize("PILLARS.QuickEffect"),
      content: html,
      buttons: {
        create: {
          label: 'Create',
          callback: (html) => {
            html = $(html);
            let mode = 2;
            let label = html.find('.label').val();
            let key = html.find('.key').val();
            let value = parseInt(html.find('.modifier').val()?.toString() || '');
            effectData.label = label;
            effectData.changes = [{ key, mode, value }];
            this.actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
          },
        },
        skip: {
          label: 'Skip',
          callback: () => this.actor.createEmbeddedDocuments('ActiveEffect', [effectData]),
        },
      },
      render: (dlg) => {
        $(dlg).find('.label').select();
      },
    }).render(true);
  }

  _onEffectEdit(ev: JQuery.ClickEvent) {
    let id = $(ev.currentTarget!).parents('.item').attr('data-item-id');
    this.object.effects.get(id!)?.sheet?.render(true);
  }

  _onEffectDelete(ev: JQuery.ClickEvent) {
    let id = $(ev.currentTarget!).parents('.item').attr('data-item-id');
    if (id) this.object.deleteEmbeddedDocuments('ActiveEffect', [id]);
  }

  _onEffectToggle(ev: JQuery.ClickEvent) {
    let id = $(ev.currentTarget!).parents('.item').attr('data-item-id');
    let effect = this.object.effects.get(id!);

    if (effect) effect.update({ disabled: !effect.data.disabled });
  }

  _onDropdown(event: JQuery.MouseUpEvent) {
    let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
    let item = this.actor.items.get(itemId!);
    if (item) this._dropdown(event, item.dropdownData());
  }
  _onDropdownAlt(event: JQuery.MouseUpEvent) {
    if (event.button == 2) {
      let itemId = $(event.currentTarget!).parents('.item').attr('data-item-id');
      let item = this.actor.items.get(itemId!);
      if (item) this._dropdown(event, item.dropdownData());
    }
  }

  async _dropdown(event: JQuery.MouseUpEvent, dropdownData : {text: string, groups? : PowerGroups}) {
    let dropdownHTML = '';
    event.preventDefault();
    let li = $(event.currentTarget!).parents('.item');
    // Toggle expansion for an item
    if (li.hasClass('expanded')) {
      // If expansion already shown - remove
      let summary = li.children('.item-summary');
      summary.slideUp(200, () => summary.remove());
    } else {
      // Add a div with the item summary belowe the item
      let div;
      if (!dropdownData) {
        return;
      } else {
        dropdownHTML = `<div class="item-summary">${TextEditor.enrichHTML(dropdownData.text)}`;
      }
      if (dropdownData.groups) {
        let groups = `<div class='power-groups'>`;
        for (let g in dropdownData.groups) {
          let html = await renderTemplate('systems/pillars-of-eternity/templates/partials/power-group.html', { group: dropdownData.groups[g], groupId: g });
          groups = groups.concat(html);
        }
        dropdownHTML = dropdownHTML.concat(groups);
      }
      dropdownHTML += '</div>';
      div = $(dropdownHTML);
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass('expanded');
  }

}
