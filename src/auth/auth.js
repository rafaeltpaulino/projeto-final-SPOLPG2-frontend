const TOKEN_KEY = 'token';

//Verifica se o utilizador está autenticado.
export const isAuthenticated = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token; // Converte a string para boolean (true se existir, false se null/vazio)
};

//Obtém o token atual (útil para enviar nos headers da API)
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

//Salva o token no armazenamento local (login bem-sucedido)
export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

//Remove o token (logout)
export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};