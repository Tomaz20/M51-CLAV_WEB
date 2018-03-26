var mongo = require('mongodb');
var mongoose = require('mongoose');
var dataBases = require('../config/database');

mongoose.Promise = require('bluebird');
mongoose.connect(dataBases.userDB, {
	useMongoClient: true,
});

var db = mongoose.connection;

// Pedido Schema
var PedidoSchema = mongoose.Schema({
	numero: {
        type: String,
        index: true
    },
	tipo: {
		type: String,
    },
    entidade: {
        nome: {
            type: {
                type: String
            },
            email: {
                type: String
            } 
        }
    },
    data: {
        type: String
    }
});

var Pedido = module.exports = mongoose.model('Pedido', PedidoSchema);

module.exports.createPedido = function (newPedido, callback) {
	newPedido.save(callback);
}

module.exports.getPedidoByNumber = function (n, callback) {
	var query = { numero: n };
	Pedido.findOne(query, callback);
}

module.exports.getCountPedidos = function (callback) {
	Pedido.count({}, callback);
}

module.exports.getPedidoById = function (id, callback) {
	Pedido.findById(id, callback);
}
