module.exports = function RecursoIndevidoError(message = 'Este recurso não pertence a este usuário') {
  this.name = 'Recurso Indevido Error';
  this.message = message;
};
