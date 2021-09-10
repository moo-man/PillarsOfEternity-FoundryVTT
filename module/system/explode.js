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
