import { world, Player, system, EntityInventoryComponent } from '@minecraft/server';

const swordCombos = new Map()

world.afterEvents.entityHit.subscribe((evd) => {
	const player = evd.entity as Player;
	const target = evd.hitEntity;
	if (player.typeId !== 'minecraft:player' || !target) return;
	const inv = player.getComponent('minecraft:inventory') as EntityInventoryComponent;
	const weapon = inv.container.getItem(player.selectedSlot)
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
	const player = evd.source as Player;
	const item = evd.itemStack;
	if (player.typeId !== 'minecraft:player' || !player.hasTag('swordPower')) return;
	player.addEffect('speed', 35);
	player.removeTag('swordPower');
});

function swordCombo(player: Player) {
	const id = player.id;
	const current = swordCombos.set(id, (swordCombos.get(id) ?? 0) + 1).get(id);
	const counter = current % 5 === 0 ? 5 : current % 5;
	const display = ''.padStart((5-counter) * 4, '§b- ').padStart(5 * 4, '§ao ').concat('§g[]');
	player.removeTag('swordPower');
	if (counter === 5) player.addTag('swordPower');
	player.onScreenDisplay.setActionBar(display);
	system.runTimeout(()=> {
		if (swordCombos.get(id) !== current) return;
		swordCombos.set(id, 0);
		player.onScreenDisplay.setActionBar(' ');
	}, 15)
}
