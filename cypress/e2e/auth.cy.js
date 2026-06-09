describe('Autenticação', () => {
  const email = `e2e+${Date.now()}@example.com`;
  const password = 'SenhaForte@123';

  it('falha ao tentar login com credenciais inválidas', () => {
    cy.visit('/login');

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('loginAlert');
    });

    cy.contains('label', 'E-mail').parent().find('input').type('naoexiste@example.com');
    cy.contains('label', 'Senha').parent().find('input').type('senhaerrada');
    cy.contains('button', 'Entrar').click();
    cy.get('@loginAlert').should('have.been.calledWith', 'E-mail ou senha inválidos');
  });

  it('realiza login com sucesso após cadastro de paciente', () => {
    cy.visit('/register');

    cy.contains('label', 'Tipo de Cadastro').parent().find('select').select('paciente');
    cy.contains('label', 'Nome Completo').parent().find('input').type('Usuário Teste');
    cy.contains('label', 'E-mail').parent().find('input').type(email);
    cy.contains('label', 'CPF').parent().find('input').type('123.456.789-09');
    cy.contains('label', 'Senha').parent().find('input').type(password);
    cy.contains('label', 'Confirmar Senha').parent().find('input').type(password);

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('registerAlert');
    });

    cy.contains('button', 'Finalizar Cadastro').click();
    cy.get('@registerAlert').should('have.been.calledWith', 'Cadastro realizado com sucesso!');
    cy.url().should('include', '/login');

    cy.visit('/login');
    cy.contains('label', 'E-mail').parent().find('input').type(email);
    cy.contains('label', 'Senha').parent().find('input').type(password);
    cy.contains('button', 'Entrar').click();

    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
  });
});
