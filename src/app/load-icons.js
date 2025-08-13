function importAll(r) {
    r.keys().forEach(r);
}

// Импортируем все svg из папки
importAll(require.context('./media/icons', false, /\.svg$/));
