/**
 * Module dependencies
 */

var nflog = require('bindings')('flog')
	,	stream = require('stream')
	, util = require('util')

/**
 * Forms a message string
 *
 * @api private
 * @param {Flog} flog
 * @param {Mixed} message
 */
function formMessage (flog, message) {
	if (message && typeof message === 'object') message = JSON.stringify(message);
	var msg = flog.format();
	msg = msg.replace(/%name/g, flog.name);
	msg = msg.replace(/%message/g, message);
	return msg;
}

/**
 * Flog constructor
 *
 * @api public
 * @param {String} name
 */

function Flog (name) {
	if (! (this instanceof Flog)) return new Flog(name);
	stream.Duplex.call(this, {allowHalfOpen:false});
	this.name = name || "";
	this.format = function () {
		var fmt = []
		if (this.name) fmt.push('(%name) - ');
		fmt.push('%message');
		return fmt.join('');
	};
	this.buffer = new Buffer(0);
	this.push('');
}

Flog.createLevel = function (level, color) {
	Flog.prototype[level] = function (message) {
		message = formMessage(this, message);
		this.write(message);
		nflog.customlog(level, color, message);
		return this;
	};
};

/**
 * Inherit from Duplex
 */
Flog.prototype.__proto__ = stream.Duplex.prototype;

Flog.prototype._write = function (chunk, encoding, next) {
	var len = this.buffer.length + chunk.length;
	this.push([chunk, '\n'].join(''));
	this.buffer = new Buffer(chunk, encoding);
	next();
};

Flog.prototype._read = function (size) {
	if (!size) return this.buffer;
	var buf = new Buffer(size)
	buf.copy(this.buffer);
	return buf;
};

Flog.prototype.log = function (message) {
	message = formMessage(this, message);
	this.write(message);
	nflog.log(message);
	return this;
};

Flog.prototype.info = function (message) {
	message = formMessage(this, message);
	this.write(message);
	nflog.info(message);
	return this;
};

Flog.prototype.warn = function (message) {
	message = formMessage(this, message);
	this.write(message);
	nflog.warn(message);
	return this;
};

Flog.prototype.debug = function (message) {
	message = formMessage(this, message);
	this.write(message);
	nflog.debug(message);
	return this;
};

Flog.prototype.error = function (message) {
	message = formMessage(this, message);
	this.write(message);
	nflog.error(message);
	return this;
};

/**
 * Module exports
 */

var flog = module.exports = Flog();

Flog.createLevel('big', 'green');

flog.on('readable', function () {
	flog.info("readable");
})

flog.log("log");
flog.info("info");
flog.debug("debug");
flog.warn("warn");
flog.error("error");
flog.big("yoooo"); 