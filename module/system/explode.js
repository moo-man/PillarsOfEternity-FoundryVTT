export default function () {
    Die.MODIFIERS["xp"] = "explodePillars"
    Die.prototype.explodePillars = function (...args) {

        // Recursively explode until there are no remaining results to explode
        let checked = 0;
        let initial = this.results.length;
        while (checked < this.results.length) {
            let r = this.results[checked];
            checked++;
            if (!r.active) continue;


            // Determine whether to explode the result and roll again!
            if (DiceTerm.compareResult(r.result, "=", this.results[checked].result)) {
                r.exploded = true;
                this.results[checked].exploded = true
                this.roll();
            }
            else break


            // Limit recursion
            if (checked > 1000) throw new Error("Maximum recursion depth for exploding dice roll exceeded");
        }
    }
}


// export default class PillarsDie extends Die
// {



//     constructor(...args)
//     {
//         super(...args)
//     }

//     explode(modifier, {recursive=true}={}) {

//         console.log(this)
//         // Match the explode or "explode once" modifier
//         const rgx = /xo?([0-9]+)?([<>=]+)?([0-9]+)?/i;
//         const match = modifier.match(rgx);
//         if ( !match ) return false;
//         let [max, comparison, target] = match.slice(1);

//         // If no comparison or target are provided, treat the max as the target
//         if ( max && !(target || comparison) ) {
//           target = max;
//           max = null;
//         }

//         // Determine target values
//         target = Number.isNumeric(target) ? parseInt(target) : this.faces;
//         comparison = comparison || "=";
//         max = Number.isNumeric(max) ? parseInt(max) : null;

//         // Recursively explode until there are no remaining results to explode
//         let checked = 0;
//         let initial = this.results.length;
//         while ( checked < this.results.length ) {
//           let r = this.results[checked];
//           checked++;
//           if (!r.active) continue;

//           // Maybe we have run out of explosions
//           if ( (max !== null) && (max <= 0) ) break;

//           // Determine whether to explode the result and roll again!
//           if ( DiceTerm.compareResult(r.result, comparison, target) ) {
//             r.exploded = true;
//             this.roll();
//             if ( max !== null ) max -= 1;
//           }

//           // Limit recursion
//           if ( !recursive && (checked >= initial) ) checked = this.results.length;
//           if ( checked > 1000 ) throw new Error("Maximum recursion depth for exploding dice roll exceeded");
//         }
//       }
// }
