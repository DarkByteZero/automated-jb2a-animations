import { buildFile } from "./file-builder/build-filepath.js"
import { aaDebugger } from "../constants/constants.js"
import { AAanimationData } from "./animation-data.js";

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

export async function staticAnimation(handler, autoObject) {
    const aaDebug = game.settings.get("autoanimations", "debug")
    let globalDelay = game.settings.get("autoanimations", "globaldelay");
    await wait(globalDelay);
    const sourceToken = handler.actorToken;

    const data = AAanimationData._staticData(handler, autoObject);
    if (aaDebug) { aaDebugger("Static Animation Start", data) }
    const onToken = await buildFile(true, data.itemName, "static", data.variant, data.color, data.customPath);

    const explosion = handler.flags.explosion ? await AAanimationData._explosionData(handler) : {};
    const explosionSound = AAanimationData._explosionSound(handler);
    const sourceFX = await AAanimationData._sourceFX(handler, sourceToken);
    const targetFX = await AAanimationData._targetFX(handler);

    const exScale = ((200 * handler.explosionRadius) / explosion?.metadata?.width) ?? 1;
    const animWidth = onToken.metadata.width;
    const arrayLength = handler.allTargets.length;

    switch (data.type) {
        case 'source':
            selfCast()
            break;
        case 'target':
            if (arrayLength === 0) { return; }
            targetCast()
            break;
        case 'targetDefault':
            if (arrayLength === 0) {
                selfCast()
            } else { targetCast() }
            break;
        case 'sourcetarget':
            selfCast()
            if (arrayLength === 0) { return; }
            targetCast()
            break;
    }
    
    async function selfCast() {
        new Sequence()
        .effect()
            .atLocation(sourceToken)
            .scale(sourceFX.sFXScale * sourceFX.scale)
            .repeats(sourceFX.repeat, sourceFX.delay)
            .belowTokens(sourceFX.below)
            .waitUntilFinished(sourceFX.startDelay)
            .playIf(sourceFX.enabled)
            .addOverride(async (effect, data) => {
                if (sourceFX.enabled) {
                    data.file = sourceFX.data.file;
                }
                return data;
            })
        .thenDo(function() {
            Hooks.callAll("aa.animationStart", sourceToken, "no-target")
        })             
        .effect()
            .file(onToken.file)
            .atLocation(sourceToken)
            //.randomizeMirrorY()
            .repeats(data.repeat, data.delay)
            //.missed(hit)
            .scale(((sourceToken.w / animWidth) * 1.5) * data.scale)
            .belowTokens(data.below)
        .effect()
            .atLocation(sourceToken)
            .scale(exScale)
            .delay(500 + explosion.delay)
            //.randomizeMirrorY()
            .repeats(data.repeat, data.delay)
            .belowTokens(explosion.below)
            .playIf(handler.explosion)
            .addOverride(async (effect, data) => {
                if (explosion.data) {
                    data.file = explosion.data.file;
                }
                return data;
            })
        .sound()
            .file(explosionSound.file)
            .playIf(() => {return explosion.data && handler.explodeSound})
            .delay(explosionSound.delay)
            .volume(explosionSound.volume)
            .repeats(data.repeat, data.delay)
        .play()
        //await wait(500)
        Hooks.callAll("aa.animationEnd", sourceToken, "no-target")
    }

    async function targetCast() {
        for (var i = 0; i < arrayLength; i++) {

            let target = handler.allTargets[i];
            if (targetFX.enabled) {
                tFXScale = 2 * target.w / targetFX.metadata.width;
            }        

            let scale = data.itemName.includes("creature") ? (sourceToken.w / animWidth) * 1.5 : (target.w / animWidth) * 1.75
            let hit;
            if (handler.playOnMiss) {
                hit = handler.hitTargetsId.includes(target.id) ? false : true;
            } else {
                hit = false;
            }

            new Sequence()
                .effect()
                    .atLocation(sourceToken)
                    .scale(sourceFX.sFXScale * sourceFX.scale)
                    .repeats(sourceFX.repeat, sourceFX.delay)
                    .belowTokens(sourceFX.below)
                    .waitUntilFinished(sourceFX.startDelay)
                    .playIf(sourceFX.enabled)
                    .addOverride(async (effect, data) => {
                        if (sourceFX.enabled) {
                            data.file = sourceFX.data.file;
                        }
                        return data;
                    })
                .thenDo(function() {
                    Hooks.callAll("aa.animationStart", sourceToken, target)
                })             
                .effect()
                    .file(onToken.file)
                    .atLocation(target)
                    //.randomizeMirrorY()
                    .repeats(data.repeat, data.delay)
                    .scale(scale * data.scale)
                    .belowTokens(data.below)
                    .name("animation")
                    .playIf(() => { return arrayLength })
                .effect()
                    .atLocation("animation")
                    .scale(exScale)
                    .delay(500 + explosion.delay)
                    //.randomizeMirrorY()
                    .repeats(data.repeat, data.delay)
                    .belowTokens(explosion.below)
                    .playIf(handler.explosion)
                    .addOverride(async (effect, data) => {
                        if (explosion.data) {
                            data.file = explosion.data.file;
                        }
                        return data;
                    })
                .sound()
                    .file(explosionSound.file)
                    .playIf(() => {return explosion.data && handler.explodeSound})
                    .delay(explosionSound.delay)
                    .volume(explosionSound.volume)
                    .repeats(data.repeat, data.delay)
                .effect()
                    .delay(targetFX.startDelay)
                    .atLocation("animation")
                    .scale(targetFX.tFXScale * targetFX.scale)
                    .repeats(targetFX.repeat, targetFX.delay)
                    .belowTokens(targetFX.below)
                    .playIf(targetFX.enabled)
                    .addOverride(async (effect, data) => {
                        if (targetFX.enabled) {
                            data.file = targetFX.data.file;
                        }
                        return data;
                    })            
                .play()
                //await wait(500)
                Hooks.callAll("aa.animationEnd", sourceToken, target)
        }
    }
}
