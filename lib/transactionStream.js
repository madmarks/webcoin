var Transform = require('stream').Transform
var util = require('util')
var Block = require('bitcore').Block

var TransactionStream = module.exports = function (blocks, opts) {
  var self = this
  Transform.call(this, { objectMode: true })

  opts = opts || {}
  this.verify = typeof opts.verify === 'boolean' ? opts.verify : true
  this.last = null
  this.blocks = blocks

  blocks.on('end', function () { self.push(null) })
  blocks.pipe(this)
}
util.inherits(TransactionStream, Transform)

TransactionStream.prototype._transform = function (block, enc, cb) {
  if (block.height == null || !(block.block instanceof Block)) {
    return cb(new Error('Input to TransactionStream must be a stream of blocks'))
  }

  var self = this
  block.block.transactions.forEach(function (tx) {
    if (this.verify && tx.verify() !== true) return
    self.push({ transaction: tx, block: block })
  })
  this.last = block
  cb(null)
}
