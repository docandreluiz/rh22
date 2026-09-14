/* GEDEP — armazenamento seguro para páginas normais e previews sandbox */
(function () {
  'use strict';
  function criarStorage(chaveTeste) {
    let memoria = {};
    let nativo = null;
    try {
      const candidato = window[chaveTeste];
      const teste = '__gedep_storage_test__';
      candidato.setItem(teste, '1');
      candidato.removeItem(teste);
      nativo = candidato;
    } catch (e) {
      nativo = null;
    }
    return {
      getItem: function (chave) { try { return nativo ? nativo.getItem(chave) : (memoria[chave] ?? null); } catch (e) { return memoria[chave] ?? null; } },
      setItem: function (chave, valor) { memoria[chave] = String(valor); try { if (nativo) nativo.setItem(chave, String(valor)); } catch (e) {} },
      removeItem: function (chave) { delete memoria[chave]; try { if (nativo) nativo.removeItem(chave); } catch (e) {} },
      clear: function () { memoria = {}; try { if (nativo) nativo.clear(); } catch (e) {} }
    };
  }
  window.gedepStorage = window.gedepStorage || criarStorage('localStorage');
  window.gedepSessionStorage = window.gedepSessionStorage || criarStorage('sessionStorage');
})();
