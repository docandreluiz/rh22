from pathlib import Path
root=Path('/home/ubuntu/gedep-integrado')
for p in [root/'modulos/gedep-rh.html',root/'modulos/gedep-cargos.html',root/'modulos/gedep-fcpe.html']:
    s=p.read_text(encoding='utf-8')
    if '../gedep-ficha.js' not in s:
        s=s.replace('</head>','    <script src="../gedep-ficha.js"></script>\n</head>',1)
    if p.name=='gedep-cargos.html':
        old="<button onclick=\"editarPessoa('\\'+escapeHtml(sId)+'\\')\""
        # insert via literal surrounding HTML
        s=s.replace("<button onclick=\"editarPessoa('\\'+escapeHtml(sId)+'\\')\"", "<button onclick=\"gedepAbrirFicha('cargos','\\'+escapeHtml(sId)+'\\')\" class=\"text-blue-600 hover:text-blue-800 text-xs font-bold\"><i class=\"fa-solid fa-id-card\"></i> Ficha</button> <button onclick=\"editarPessoa('\\'+escapeHtml(sId)+'\\')\"",1)
    elif p.name=='gedep-fcpe.html':
        s=s.replace("<button onclick=\"verHistoricoServidor('${s.id}')\"", "<button onclick=\"gedepAbrirFicha('fcpe','${s.id}')\" class=\"bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded text-xs font-semibold border border-slate-200\" title=\"Ficha pessoal\"><i class=\"fa-solid fa-id-card mr-1\"></i> Ficha</button> <button onclick=\"verHistoricoServidor('${s.id}')\"",1)
    else:
        target="""<td>${escapeHtml(r['DESC SIT FUNCIONAL'])}</td>"""
        repl="""<td>${escapeHtml(r['DESC SIT FUNCIONAL'])}</td>
                    <td><button onclick=\"gedepAbrirFicha('rh', encodeURIComponent(r['idServidor'] || r['CPF'] || r['NOME SERVIDOR']))\" class=\"btn btn-blue\" style=\"padding:.25rem .6rem;font-size:.75rem\">Ficha</button></td>"""
        s=s.replace(target,repl,1)
    p.write_text(s,encoding='utf-8')
