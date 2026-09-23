// ==UserScript==
// @name         Import Konfiguracji LocalStorage (Dynamiczne ID)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Wrzuca konfigurację do localStorage z automatyczną podmianą ID konta
// @author       Twój Nick
// @match        *://*.margonem.pl/*
// @grant        GM_xmlhttpRequest
// @connect      affekk.info.pl
// ==/UserScript==

(function() {
    'use strict';

    const dataUrl = 'https://www.affekk.info.pl/dane.json';

    // Bezpieczna funkcja wyciągająca wartość ciasteczka (omija ograniczenia piaskownicy Tampermonkey)
    function getUserIdFromCookie() {
        const match = document.cookie.match(new RegExp('(^| )user_id=([^;]+)'));
        return match ? match[2] : null;
    }

    GM_xmlhttpRequest({
        method: "GET",
        url: dataUrl,
        onload: function(response) {
            if (response.status === 200) {
                try {
                    // Pobieramy surowy tekst JSON-a z Twojego serwera
                    let rawText = response.responseText;

                    // Pobieramy aktualne ID zalogowanego gracza z ciasteczek
                    const currentUserId = getUserIdFromCookie();

                    if (currentUserId) {
                        // Podmieniamy wszystkie wystąpienia starego ID (9847442) na nowe ID gracza.
                        // Flaga 'g' (global) sprawia, że podmienią się WSZYSTKIE wystąpienia w pliku.
                        rawText = rawText.replace(/9847442/g, currentUserId);
                        console.log(`[Tampermonkey] Wykryto ID gracza: ${currentUserId}. Zastąpiono wartości w konfiguracji.`);
                    } else {
                        console.warn('[Tampermonkey] Nie udało się odczytać ciasteczka user_id!');
                    }

                    // Dopiero po podmiance formatujemy tekst na obiekt JSON
                    const storageData = JSON.parse(rawText);

                    // Wstrzyknięcie danych do localStorage
                    for (const [key, value] of Object.entries(storageData)) {
                        localStorage.setItem(key, value);
                        console.log(`[Tampermonkey] Wgrano konfigurację: ${key}`);
                    }

                    console.log('[Tampermonkey] Zaktualizowano wszystkie ustawienia dodatków.');

                } catch (error) {
                    console.error('[Tampermonkey] Błąd podczas przetwarzania pliku JSON:', error);
                }
            } else {
                console.error('[Tampermonkey] Błąd połączenia ze stroną:', response.status);
            }
        }
    });
})();
