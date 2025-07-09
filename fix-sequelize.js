const fs = require('fs');
const path = require('path');

// Fix reservaController.js
const reservaControllerPath = path.join(__dirname, 'controllers/api/reservaController.js');
let reservaContent = fs.readFileSync(reservaControllerPath, 'utf8');

// Fix includes in index method
reservaContent = reservaContent.replace(
    /{ model: db\.Usuario, attributes: \['id', 'nome', 'login'\] }/g,
    "{ model: db.Usuario, as: 'usuario', attributes: ['id', 'nome', 'login'] }"
);
reservaContent = reservaContent.replace(
    /{ model: db\.Espaco, attributes: \['id', 'nome', 'localizacao'\] }/g,
    "{ model: db.Espaco, as: 'espaco', attributes: ['id', 'nome', 'localizacao'] }"
);

fs.writeFileSync(reservaControllerPath, reservaContent);
console.log('✅ Fixed reservaController.js');

// Fix espacoController.js
const espacoControllerPath = path.join(__dirname, 'controllers/api/espacoController.js');
let espacoContent = fs.readFileSync(espacoControllerPath, 'utf8');

// Fix include in index method
espacoContent = espacoContent.replace(
    'include: [db.Amenity],',
    "include: [{ model: db.Amenity, as: 'amenities' }],"
);

// Fix include in show method
espacoContent = espacoContent.replace(
    /model: db\.Amenity,(\s*)through:/,
    "model: db.Amenity,\n                        as: 'amenities',$1through:"
);

fs.writeFileSync(espacoControllerPath, espacoContent);
console.log('✅ Fixed espacoController.js');

console.log('🎉 All files fixed!');