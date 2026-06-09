use uninerd;

DROP TABLE IF EXISTS agendamentos;
DROP TABLE IF EXISTS medicos_planos;
DROP TABLE IF EXISTS horarios;
DROP TABLE IF EXISTS planos_de_saude;
DROP TABLE IF EXISTS medicos;
DROP TABLE IF EXISTS especialidades;
DROP TABLE IF EXISTS usuarios;

DELETE FROM especialidades;

CREATE TABLE especialidades (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE,
    crm_numero VARCHAR(10),
    crm_uf CHAR(2),
    id_especialidade INT,
    nivel VARCHAR(10) NOT NULL CHECK (nivel IN ('medico', 'paciente')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_especialidade) REFERENCES especialidades(id)
);

    CREATE TABLE agendamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT,
        id_medico INT,
        data_consulta DATE, 
        status VARCHAR(20) DEFAULT 'AGENDADO',
        
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
        FOREIGN KEY (id_medico) REFERENCES usuarios(id)
    );

-- Dados Iniciais para Teste com todas as especialidades
INSERT INTO especialidades (id, nome) VALUES
(1, 'Acupuntura'),
(2, 'Alergia e imunologia'),
(3, 'Anestesiologia'),
(4, 'Angiologia'),
(5, 'Cardiologia'),
(6, 'Cirurgia cardiovascular'),
(7, 'Cirurgia da mão'),
(8, 'Cirurgia de cabeça e pescoço'),
(9, 'Cirurgia do aparelho digestivo'),
(10, 'Cirurgia geral'),
(11, 'Cirurgia oncológica'),
(12, 'Cirurgia pediátrica'),
(13, 'Cirurgia plástica'),
(14, 'Cirurgia torácica'),
(15, 'Cirurgia vascular'),
(16, 'Clínica médica'),
(17, 'Coloproctologia'),
(18, 'Dermatologia'),
(19, 'Endocrinologia e metabologia'),
(20, 'Endoscopia'),
(21, 'Gastroenterologia'),
(22, 'Genética médica'),
(23, 'Geriatria'),
(24, 'Ginecologia e obstetrícia'),
(25, 'Hematologia e hemoterapia'),
(26, 'Homeopatia'),
(27, 'Infectologia'),
(28, 'Mastologia'),
(29, 'Medicina de emergência'),
(30, 'Medicina de família e comunidade'),
(31, 'Medicina do trabalho'),
(32, 'Medicina do tráfego'),
(33, 'Medicina esportiva'),
(34, 'Medicina física e reabilitação'),
(35, 'Medicina intensiva'),
(36, 'Medicina legal e perícia médica'),
(37, 'Medicina nuclear'),
(38, 'Medicina preventiva e social'),
(39, 'Nefrologia'),
(40, 'Neurocirurgia'),
(41, 'Neurologia'),
(42, 'Nutrologia'),
(43, 'Oftalmologia'),
(44, 'Oncologia clínica'),
(45, 'Ortopedia e traumatologia'),
(46, 'Otorrinolaringologia'),
(47, 'Patologia'),
(48, 'Patologia clínica/medicina laboratorial'),
(49, 'Pediatria'),
(50, 'Pneumologia'),
(51, 'Psiquiatria'),
(52, 'Radiologia e diagnóstico por imagem'),
(53, 'Radioterapia'),
(54, 'Reumatologia'),
(55, 'Urologia');

INSERT INTO usuarios (nome, email, senha, cpf, crm_numero, crm_uf, id_especialidade, nivel)
VALUES ('Dr. João Silva', 'joao@exemplo.com', '$2a$10$hashfake...', '12345678901', '123456', 'SP', 5, 'medico');

INSERT INTO usuarios (nome, email, senha, cpf, crm_numero, crm_uf, id_especialidade, nivel)
VALUES ('Dra. Maria Oliveira', 'maria@exemplo.com', '$2a$10$hashfake...', '23456789012', '654321', 'RJ', 49, 'medico');

INSERT INTO usuarios (nome, email, senha, cpf, nivel)
VALUES ('Paciente Teste 1', 'paciente1@exemplo.com', '$2a$10$hashfake...', '34567890123', 'paciente');

INSERT INTO usuarios (nome, email, senha, cpf, nivel)
VALUES ('Paciente Teste 2', 'paciente2@exemplo.com', '$2a$10$hashfake...', '45678901234', 'paciente');

INSERT INTO usuarios (nome, email, senha, cpf, nivel)
VALUES ('teste15', 'teste15@gmail.com', 'teste15', '44444444444', 'paciente');

INSERT INTO usuarios (nome, email, senha, cpf, crm_numero, crm_uf, id_especialidade, nivel)
VALUES ('Dra. teste', 'drteste@gmail.com.com', '555555555', '23456789011', '654321', 'RJ', 49, 'medico');
