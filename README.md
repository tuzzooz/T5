## 🚀 Tecnologias Utilizadas (T5)

O projeto é dividido em duas partes principais: um backend construído com Node.js e Prisma, e um frontend desenvolvido com React.

---

### Backend

O servidor é responsável pela lógica de negócio, comunicação com o banco de dados via Prisma e por servir a API para o cliente.

| Dependência | Versão |
| :--- | :--- |
| **Node.js** | **16.x+ (recomendado)** |
| Express | ^5.1.0 |
| Prisma | ^6.10.1 |
| TypeScript | ^5.8.3 |
| ts-node-dev | ^2.0.0 |
| cors | ^2.8.5 |
| helmet | ^8.1.0 |

---

### Frontend

A interface do usuário é uma Single Page Application (SPA) reativa e moderna, construída com a biblioteca React.

| Dependência | Versão |
| :--- | :--- |
| **Node.js** | **16.x (obrigatório)** |
| React | ^19.1.0 |
| React Router DOM | ^7.6.3 |
| React Query | ^5.81.5 |
| Axios | ^1.10.0 |
| Bootstrap | ^5.3.7 |
| React-Bootstrap | ^2.10.10 |
| React Scripts | 5.0.1 |

**Atenção:** ⚠️ O frontend utiliza `react-scripts@5.0.1`, que é mais estável com **Node.js na versão 16.x**. Versões mais novas do Node (18.x ou superiores) podem causar erros de compatibilidade. Recomenda-se usar a mesma versão do Node.js para ambos os ambientes.

## ⚙️ Como Executar o Projeto

Siga os passos abaixo para configurar e rodar a aplicação localmente. O projeto requer que tanto o **Backend** quanto o **Frontend** estejam em execução simultaneamente em terminais diferentes.

### Pré-requisitos

Antes de começar, certifique-se de que você tem os seguintes softwares instalados:

-   **Node.js**: `v16.x` (Obrigatório para compatibilidade com o frontend)
-   **npm**: `v8.x` ou compatível com o Node 16

---

### 1. Configurando o Backend

O backend é responsável por servir a API que o frontend consome.

1.  **Navegue até a pasta do backend:**
    ```bash
    cd backend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo chamado `.env` na raiz da pasta `backend` e adicione a seguinte variável. Ela é usada pelo Prisma para se conectar ao banco de dados.

    ```env
    DATABASE_URL="file:./dev.db"
    ```

4.  **Execute as migrações do banco de dados:**
    Este comando irá criar o banco de dados (se não existir) e aplicar todas as tabelas necessárias.
    ```bash
    npx prisma migrate dev
    ```

5.  **Inicie o servidor backend:**
    ```bash
    npm run dev
    ```

✅ O servidor backend estará em execução, geralmente em `http://localhost:3001`. Mantenha este terminal aberto.

---

### 2. Configurando o Frontend

Agora, em um **novo terminal**, vamos configurar e iniciar a interface do usuário.

1.  **Navegue até a pasta do frontend:**
    ```bash
    cd frontend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Inicie a aplicação React:**
    ```bash
    npm start
    ```

✅ O React iniciará o servidor de desenvolvimento e abrirá a aplicação automaticamente no seu navegador, disponível em `http://localhost:3000`.