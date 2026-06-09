describe('Cadastro de Usuário', () => {
  it('exibe erro quando as senhas não conferem', () => {
    cy.visit('/register');

    cy.contains('label', 'Tipo de Cadastro').parent().find('select').select('paciente');
    cy.contains('label', 'Nome Completo').parent().find('input').type('Teste Falha');
    cy.contains('label', 'E-mail').parent().find('input').type('falha+e2e@example.com');
    cy.contains('label', 'CPF').parent().find('input').type('123.456.789-09');
    cy.contains('label', 'Senha').parent().find('input').type('Senha@1234');
    cy.contains('label', 'Confirmar Senha').parent().find('input').type('SenhaDiferente@1234');

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('pwdAlert');
    });
    cy.contains('button', 'Finalizar Cadastro').click();
    cy.get('@pwdAlert').should('have.been.calledWith', 'As senhas não conferem');
  });

  it('cadastra um paciente com sucesso', () => {
    const email = `register+${Date.now()}@example.com`;
    const password = 'SenhaForte@123';

    cy.visit('/register');
    cy.contains('label', 'Tipo de Cadastro').parent().find('select').select('paciente');
    cy.contains('label', 'Nome Completo').parent().find('input').type('Paciente E2E');
    cy.contains('label', 'E-mail').parent().find('input').type(email);
    cy.contains('label', 'CPF').parent().find('input').type('123.456.789-09');
    cy.contains('label', 'Senha').parent().find('input').type(password);
    cy.contains('label', 'Confirmar Senha').parent().find('input').type(password);

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('registerSuccess');
    });
    cy.contains('button', 'Finalizar Cadastro').click();
    cy.get('@registerSuccess').should('have.been.calledWith', 'Cadastro realizado com sucesso!');
    cy.url().should('include', '/login');
  });
});
