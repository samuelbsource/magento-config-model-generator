import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({
    ignoreDeclaration: true,
    ignoreAttributes: false,
    isArray: (name, jpath, isLeafNode, isAttribute) => {
        return ['section', 'group', 'field'].indexOf(name) !== -1
    }
})

/**
 * Parse the config from XML and extract fields.
 * @param {string} value 
 * @returns {object}
 */
export function parseConfig(value) {
    const data = parser.parse(value)
    const fields = []

    if (data && data.config && data.config.system && data.config.system.section) {
        for (const section of data.config.system.section) {
            if (section.group) {
                for (const group of section.group) {
                    if (group.field) {
                        for (const field of group.field) {
                            fields.push({
                                id: field['@_id'],
                                type: field['@_type'],
                                showInDefault: field['@_showInDefault'],
                                showInWebsite: field['@_showInWebsite'],
                                showInStore: field['@_showInStore'],
                                canRestore: field['@_canRestore'],

                                backendModel: field['backend_model'],
                                configPath: field['config_path'] ? field['config_path'] : `${section['@_id']}/${group['@_id']}/${field['@_id']}`,

                                section: {
                                    id: section['@_id'],
                                    showInDefault: field['@_showInDefault'],
                                    showInWebsite: field['@_showInWebsite'],
                                    showInStore: field['@_showInStore'],
                                    canRestore: field['@_canRestore'],
                                },
                                group: {
                                    id: group['@_id'],
                                    showInDefault: field['@_showInDefault'],
                                    showInWebsite: field['@_showInWebsite'],
                                    showInStore: field['@_showInStore'],
                                    canRestore: field['@_canRestore'],
                                }
                            })
                        }
                    }
                }
            }
        }
    }

    return { fields }
}
