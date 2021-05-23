import { JB2APATREONDB } from "./jb2a-patreon-database.js";
import { JB2AFREEDB } from "./jb2a-free-database.js";

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function explodeOnTarget(handler) {

    function moduleIncludes(test) {
        return !!game.modules.get(test);
    }

    let obj01 = moduleIncludes("jb2a_patreon") === true ? JB2APATREONDB : JB2AFREEDB;

    let obj02;
    let obj03;
    let color;
    let variant = handler.animExVariant;
    let filePath;
    switch (true) {
        case handler.animExVariant === "shatter":
            obj02 = "shatter";
            color = handler.animExColor;
            filePath = obj01[obj02][color];
            break;
        default:
            obj02 = "explosion";
            color = handler.animExColor;
            filePath = obj01[obj02][variant][color];
    }

    let multiplier;
    switch (variant) {
        case ('05'):
        case ('06'):
        case ('07'):
            multiplier = 1500;
            break;
        default:
            multiplier = 1000;
    }
    let divisor = (multiplier * (1/(handler.animExRadius)));

    let globalDelay = game.settings.get("autoanimations", "globaldelay");
    await wait(globalDelay);

    async function cast() {
        var arrayLength = handler.allTargets.length;
        let loops = handler.animExLoop;

        for (var i = 0; i < arrayLength; i++) {
            let target = handler.allTargets[i];
            let Scale = (canvas.scene.data.grid / divisor);

            // Defines the spell template for FXMaster
            let spellAnim =
            {
                file: filePath,
                position: target.center,
                anchor: {
                    x: 0.5,
                    y: 0.5
                },
                angle: 0,
                scale: {
                    x: Scale,
                    y: Scale
                }
            };

            async function SpellAnimation(number) {

                let x = number;
                let interval = 1000;
                for (var i = 0; i < x; i++) {
                    setTimeout(function () {
                        canvas.fxmaster.playVideo(spellAnim);
                        game.socket.emit('module.fxmaster', spellAnim);
                    }, i * interval);
                }
            }
            // The number in parenthesis sets the number of times it loops
            SpellAnimation(loops)
            /*
                    let shockWave =
                        [{
                            filterType: "wave",
                            filterId: "shockWave",
                            autoDestroy: true,
                            time: 0,
                            strength: 0.03,
                            frequency: 15,
                            maxIntensity: 4.0,
                            minIntensity: 0.5,
                            padding: 25,
                            animated:
                            {
                                time:
                                {
                                    loopDuration: 500,
                                    loops: 5,
                                    active: true,
                                    speed: 0.0180,
                                    animType: "move",
                                }
                            }
                        }];
                        */
            //if (game.settings.get("autoanimations", "tmfx")) {
            //await wait(400);
            //TokenMagic.addUpdateFiltersOnTargeted(shockWave);
            //await wait(2500);
            //TokenMagic.deleteFiltersOnTargeted("burn");
            //await wait(250);
            //TokenMagic.deleteFiltersOnTargeted("shockWave");
            //}
        }
    }
    cast();
}

export default explodeOnTarget;