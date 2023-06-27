import { world, system } from '@minecraft/server';
const swordCombos = new Map();
world.afterEvents.entityHit.subscribe((evd) => {
    const player = evd.entity;
    const target = evd.hitEntity;
    if (player.typeId !== 'minecraft:player' || !target)
        return;
    const inv = player.getComponent('minecraft:inventory');
    const weapon = inv.container.getItem(player.selectedSlot);
    switch (weapon.typeId.slice(-4)) {
        case 'word':
            swordCombo(player);
            break;
        case '_axe':
            console.warn('axe');
            break;
        default:
            return;
    }
});
world.afterEvents.itemUse.subscribe((evd) => {
    const player = evd.source;
    const item = evd.itemStack;
    if (player.typeId !== 'minecraft:player' || !player.hasTag('swordPower'))
        return;
    switch (item.typeId.slice(-4)) {
        case 'word':
            swordPower(player);
            break;
        case '_axe':
            console.warn('axe');
            break;
        default:
            return;
    }
});
function swordCombo(player) {
    const id = player.id;
    const current = swordCombos.set(id, (swordCombos.get(id) ?? 0) + 1).get(id);
    if (current > 10) {
        player.removeEffect('speed');
        player.addEffect('weakness', 7, { amplifier: 255, showParticles: false });
        player.onScreenDisplay.setActionBar('§cCombo Failed');
        swordCombos.delete(player.id);
        return;
    }
    const counter = current % 5 === 0 ? 5 : current % 5;
    const display = ''.padStart((5 - counter) * 4, '§b- ').padStart(5 * 4, '§ao ').concat(`§${counter > 5 ? '4' : 'g'}[]`);
    player.removeTag('swordPower');
    if (counter === 5)
        player.addTag('swordPower');
    player.onScreenDisplay.setActionBar(display);
    system.runTimeout(() => {
        if (swordCombos.get(id) !== current)
            return;
        swordCombos.delete(id);
        player.onScreenDisplay.setActionBar(' ');
        player.removeTag('swordPower');
    }, 20);
}
function swordPower(player) {
    if (!player.removeTag('swordPower'))
        return;
    if (swordCombos.get(player.id) === 10) {
        player.addEffect('strength', 35, { showParticles: false });
        swordCombos.delete(player.id);
    }
    else {
        player.addEffect('speed', 35, { showParticles: false });
    }
    player.onScreenDisplay.setActionBar('§ao o o o o §l§d#');
}
