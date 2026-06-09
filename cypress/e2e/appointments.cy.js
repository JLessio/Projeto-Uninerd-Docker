describe('CRUD de Consultas Médicas', () => {
  const email = `appointment+${Date.now()}@example.com`;
  const password = 'SenhaForte@123';

  before(() => {
    cy.visit('/register');
    cy.contains('label', 'Tipo de Cadastro').parent().find('select').select('paciente');
    cy.contains('label', 'Nome Completo').parent().find('input').type('Paciente App');
    cy.contains('label', 'E-mail').parent().find('input').type(email);
    cy.contains('label', 'CPF').parent().find('input').type('123.456.789-09');
    cy.contains('label', 'Senha').parent().find('input').type(password);
    cy.contains('label', 'Confirmar Senha').parent().find('input').type(password);
    cy.contains('button', 'Finalizar Cadastro').click();
    cy.visit('/login');
    cy.contains('label', 'E-mail').parent().find('input').type(email);
    cy.contains('label', 'Senha').parent().find('input').type(password);
    cy.contains('button', 'Entrar').click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
  });

  it('cria, edita e exclui uma consulta médica', () => {
    const appointmentDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    cy.visit('/appointments/new');

    cy.contains('label', 'Médico').parent().find('select').should('exist').find('option').then(($options) => {
      expect($options.length).to.be.greaterThan(1);
      const doctorValue = String($options.eq(1).val());
      cy.contains('label', 'Médico').parent().find('select').select(doctorValue);
    });

    cy.contains('label', 'Data').parent().find('input[type="date"]').type(appointmentDate);
    cy.contains('label', 'Hora').parent().find('select').select('08:00');
    cy.contains('label', 'Tipo de Atendimento').parent().find('select').select('consulta');

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('createAlert');
    });
    cy.contains('button', 'Confirmar Agendamento').click();
    cy.get('@createAlert').should('have.been.calledWith', 'Agendamento criado com sucesso!');

    cy.visit('/appointments');
    cy.contains('button', 'Editar').first().should('be.visible').click({ force: true });
    cy.url().should('include', '/appointments/edit/');

    cy.contains('label', 'Estado').parent().find('select').select('concluído');
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('updateAlert');
    });
    cy.contains('button', 'Guardar Alterações').click();
    cy.get('@updateAlert').should('have.been.calledWith', 'Agendamento atualizado com sucesso!');

    cy.visit('/appointments');
    cy.on('window:confirm', () => true);
    cy.contains('button', 'Excluir').first().click({ force: true });
  });
});
