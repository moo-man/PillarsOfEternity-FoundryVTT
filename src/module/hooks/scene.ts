export default function () 
{
    Hooks.on("preCreateScene", (scene : Scene) => 
    {
        //@ts-ignore
        scene.updateSource({gridType : 2});
    });
}