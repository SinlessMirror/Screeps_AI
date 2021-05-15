var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        // Storing sources to memory by ID and finding closest 
        var availableSources = creep.room.memory.sources;
        var serializedSources = []
        var i = 0;
        var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        for(let everySource in availableSources){
            serializedSources.push(Game.getObjectById(availableSources[i]))
            var i = i+1;
        }
        var closestSource = creep.pos.findClosestByPath(serializedSources);
        
        //VARIABLES
        var containers = _.filter(creep.room.find(FIND_STRUCTURES), (s) => s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity([RESOURCE_ENERGY]) != 0);
        var closest_container = creep.pos.findClosestByPath(containers);
        var creepsInRoomArray = creep.room.find(FIND_MY_CREEPS)
        var mulesInRoom = _.filter(creepsInRoomArray, (creep) => creep.memory.role == 'mule');
        //Make sure we didn't get lost
        if(creep.memory.creepRoom){
            // If Building & no energy -> Stop Building
    	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.building = false;
                creep.say('🔄 harvest');
    	    }
    	    // If Not building && full of energy -> start building!
    	    if(!creep.memory.building && creep.store.getFreeCapacity([RESOURCE_ENERGY]) == 0 && targets.length > 0) {
    	        creep.memory.building = true;
    	        creep.memory.requestingEnergy = false;
                creep.say('🚧 build');
                
            }
    	    // If building && not out of energy && no build jobs to do -> Repair
    	    if(creep.memory.building && !creep.store[RESOURCE_ENERGY] == 0 && creep.room.find(FIND_CONSTRUCTION_SITES).length == 0) {
    	        var repair_target = creep.room.find(FIND_MY_STRUCTURES, {
    	            filter: (structure) => {
    	                return(structure.hits < structure.hitsMax);
    	            }
    	        });
    	        
    	        if(creep.repair(repair_target[0]) == ERR_NOT_IN_RANGE){
    	            creep.moveTo(repair_target[0]);
    	        }
    	    }
            // If Building
    	    if(creep.memory.building) {
                if(targets.length > 0) {
                    if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                if(targets.length == 0){
                    creep.memory.building = false;
                }
    	    }
    	    // if !building
    	    else {
                //IF NOT FULL AND CONTAINERS NEARBY -> FILL AT CONTAINER
    	        if(creep.store.getUsedCapacity(RESOURCE_ENERGY) < creep.store.getCapacity(RESOURCE_ENERGY) && containers.length >0){
                    if(creep.withdraw(closest_container,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closest_container)
                    }
                }
                //IF NOT FULL AND NO CONTAINERS AND THERE ARE CONSTRUCTION SITES -> REQUEST MULE
                else if(mulesInRoom.length > 0 && targets.length > 0){
                    creep.memory.requestingEnergy = true;
                }
                //IF NOT FULL AND NO CONTAINERS AND NO CONSTRUCTION SITES -> TURN OFF REQUESTING
                else if(mulesInRoom.length > 0 && targets.length === 0){
                    creep.memory.requestingEnergy = false;
                }
                //IF NOT FULL AND NO CONTAINERS AND NO MULES -> HARVEST SOURCE
                else if(creep.store.getUsedCapacity(RESOURCE_ENERGY) < creep.store.getCapacity(RESOURCE_ENERGY) && containers.length === 0 && targets.length > 0){
                    var sources = creep.room.find(FIND_SOURCES);
                    creep.memory.requestingEnergy = false;
                    if(creep.harvest(sources[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[0]);
                    }
                }
    	        if(creep.store.getUsedCapacity(RESOURCE_ENERGY) === creep.store.getCapacity(RESOURCE_ENERGY) && targets.length === 0){
    	            creep.moveTo(29,29);
    	        }
    	    }
        }
	}
};

module.exports = roleBuilder;