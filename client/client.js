import alt from "alt-client";
import * as native from "natives";

alt.loadRmlFont("./fonts/roboto_medium.ttf", "sampfont", false, true);

const document = new alt.RmlDocument("./vehiclelabel.rml");
const container = document.getElementByID("vehiclelabelContainer");
document.show();

let vehiclelabel = [];
let showlabel = true;

alt.on("gameEntityCreate", (entity) => {
    if(!showlabel || !entity.valid || entity === alt.Player.local) return;

    if(entity instanceof alt.Vehicle) {
        createVehicleLabel(entity);
    }
});

alt.on("gameEntityDestroy", (entity) => {
    if(!entity.valid || entity === alt.Player.local) return;
    
    if(entity instanceof alt.Vehicle) {
        destroyVehicleLabel(entity);
    }
});

function createVehicleLabel(entity) {
    if(entity instanceof alt.Vehicle) {
        let entityFound = false;
        for(let i = 0; i < vehiclelabel.length; i++) {
            if(vehiclelabel[i].entity === entity) {
                entityFound = true;
            }
        }
        if(entityFound === true) return;

        alt.log(`[createVehicleLabel] entityID: ${entity.scriptID}`);

        //vehiclelabel
        const label = document.createElement("div");
        label.addClass("vehiclelabel");
        container.appendChild(label);

        vehiclelabel.push({ label, entity });
    }
}

function destroyVehicleLabel(entity) {
    alt.log(`[destroyVehicleLabel] entityID: ${entity.scriptID}`);
    
    if(entity instanceof alt.Vehicle) {
        for(let i = 0; i < vehiclelabel.length; i++) {
            if(entity === vehiclelabel[i].entity) {
                container.removeChild(vehiclelabel[i].label);
                vehiclelabel[i].label.destroy();

                vehiclelabel.splice(i, 1);
            }
        }
    }
}

alt.everyTick(() => {
    for (const vlabel of vehiclelabel) {

        const x = vlabel.entity.pos.x;
        const y = vlabel.entity.pos.y;
        const z = vlabel.entity.pos.z;

        const playerDist = distance(alt.Player.local.pos, vlabel.entity.pos);

        if (native.isSphereVisible(x, y, z, 0.0099999998)
            && playerDist <= 15.0) {

            const screen = alt.worldToScreen(x, y, z);

            //vehiclelabel
            vlabel.label.removeClass("hide");
            vlabel.label.setProperty("left", `${screen.x - (parseInt(vlabel.label.offsetWidth) / 2)}px`);
            vlabel.label.setProperty("top", `${screen.y}px`);
            vlabel.label.innerRML = `[id: ${vlabel.entity.scriptID}, type: ${native.getDisplayNameFromVehicleModel(native.getEntityModel(vlabel.entity))}, Health: ${native.getEntityHealth(vlabel.entity).toFixed(1)}]<br/>Distance: ${playerDist.toFixed(2)}<br/>PassengerSeats: ${native.getVehicleMaxNumberOfPassengers(vlabel.entity)}<br/>cPos: x: ${vlabel.entity.pos.x.toFixed(3)}, y: ${vlabel.entity.pos.y.toFixed(3)}, z: ${vlabel.entity.pos.z.toFixed(3)}`;
        } else {
            vlabel.label.addClass("hide");
        }
    }
});

function distance(vector1, vector2) {
    if (vector1 === undefined || vector2 === undefined) {
        throw new Error('AddVector => vector1 or vector2 is undefined');
    }
    return Math.sqrt(Math.pow(vector1.x - vector2.x, 2) + Math.pow(vector1.y - vector2.y, 2) + Math.pow(vector1.z - vector2.z, 2));
}