import { execute } from "./js/template.js"
import { parseConfig } from './js/parser.js'

const editor = ace.edit("editor")
editor.setTheme("ace/theme/github")
editor.session.setMode("ace/mode/xml")

const editorModal = ace.edit("editor-modal")
editorModal.setTheme("ace/theme/github")
editorModal.session.setMode("ace/mode/php")

document.getElementById('form').addEventListener('submit', function onSubmitForm(event) {
    event.preventDefault()
    event.stopPropagation()

    const vendorInput = document.getElementById('vendor-name');
    const moduleInput = document.getElementById('module-name');

    document.getElementById('modal').style.display = 'block'
    editorModal.setValue(execute({
        vendor: vendorInput.value,
        module: moduleInput.value,
        config: parseConfig(editor.getValue()),
        includeClearCache: true
    }), -1)
})

document.getElementById('modal-copy').addEventListener('click', function onSubmitForm(event) {
    event.preventDefault()
    event.stopPropagation()

    navigator.clipboard.writeText(editorModal.getValue());
})

document.getElementById('modal-close').addEventListener('click', function onSubmitForm(event) {
    event.preventDefault()
    event.stopPropagation()

    document.getElementById('modal').style.display = ''
    editorModal.setValue('', -1)
})