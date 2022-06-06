export default function () {
    Hooks.on("preCreateScene", (scene : Scene) => {
        
        scene.data.update({gridType : 2, gridDistance : 2, gridUnits : "m"});
    })
}