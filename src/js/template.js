import * as changeCase from "change-case";

function generateSerializedAccess(field) {
    let scope = 'SCOPE_DEFAULT';
    if (field.showInStore === '1') {
        scope = 'SCOPE_STORE';
    } else if (field.showInWebsite === '1') {
        scope = 'SCOPE_WEBSITE';
    }

    return `
    /**
     * Get unserialized value of ${field.configPath}
     *
     * @param string $scopeType
     * @param null $scopeCode
     * @return array
     */
    public function get${changeCase.pascalCase(field.id)}(string $scopeType = self::${scope}, $scopeCode = null): array
    {
        $valueSerialized = $this->getValue(self::XML_${changeCase.constantCase(field.id)}, $scopeType, $scopeCode);
        return $this->serializer->unserialize($valueSerialized ?: '[]');
    }

    /**
     * Check if unserialized value of ${field.configPath} contains $value
     *
     * @param mixed $value
     * @param string $scopeType
     * @param null $scopeCode
     * @return bool
     */
    public function has${changeCase.pascalCase(field.id)}($value, string $scopeType = self::${scope}, $scopeCode = null): bool
    {
        return in_array($value, $this->get${changeCase.pascalCase(field.id)}($scopeType, $scopeCode));
    }

    /**
     * Set or reset the value of ${field.configPath}
     *
     * @param array|string|null $value - If null, the value is reset to the default value.
     * @param string $scopeType
     * @param null $scopeCode
     * @return self
     * @throws LocalizedException
     */
    public function set${changeCase.pascalCase(field.id)}($value, string $scopeType = self::SCOPE_DEFAULT, $scopeCode = null): self
    {
        if ($value === null) {
            $this->deleteValue(self::XML_${changeCase.constantCase(field.id)}, $scopeType, $scopeCode);
        } elseif (is_array($value)) {
            $valueSerialized = $this->serializer->serialize($value);
            $this->setValue(self::XML_${changeCase.constantCase(field.id)}, $valueSerialized, $scopeType, $scopeCode);
        } else {
            $this->setValue(self::XML_${changeCase.constantCase(field.id)}, $value, $scopeType, $scopeCode);
        }
        return $this;
    }\
`;
}

function generateArrayAccess(field) {
    let scope = 'SCOPE_DEFAULT';
    if (field.showInStore === '1') {
        scope = 'SCOPE_STORE';
    } else if (field.showInWebsite === '1') {
        scope = 'SCOPE_WEBSITE';
    }

    return `
    /**
     * Get unserialized value of ${field.configPath}
     *
     * @param string $scopeType
     * @param null $scopeCode
     * @return array
     */
    public function get${changeCase.pascalCase(field.id)}(string $scopeType = self::${scope}, $scopeCode = null): array
    {
        $valueSerialized = $this->getValue(self::XML_${changeCase.constantCase(field.id)}, $scopeType, $scopeCode);
        return empty($valueSerialized) ? [] : explode(',', $valueSerialized);
    }

    /**
     * Check if unserialized value of ${field.configPath} contains $value
     *
     * @param mixed $value
     * @param string $scopeType
     * @param null $scopeCode
     * @return bool
     */
    public function has${changeCase.pascalCase(field.id)}($value, string $scopeType = self::${scope}, $scopeCode = null): bool
    {
        return in_array($value, $this->get${changeCase.pascalCase(field.id)}($scopeType, $scopeCode));
    }

    /**
     * Set or reset the value of ${field.configPath}
     *
     * @param array|string|null $value - If null, the value is reset to the default value.
     * @param string $scopeType
     * @param null $scopeCode
     * @return self
     * @throws LocalizedException
     */
    public function set${changeCase.pascalCase(field.id)}($value, string $scopeType = self::SCOPE_DEFAULT, $scopeCode = null): self
    {
        if ($value === null) {
            $this->deleteValue(self::XML_${changeCase.constantCase(field.id)}, $scopeType, $scopeCode);
        } elseif (is_array($value)) {
            $valueSerialized = implode(',', $value);
            $this->setValue(self::XML_${changeCase.constantCase(field.id)}, $valueSerialized, $scopeType, $scopeCode);
        } else {
            $this->setValue(self::XML_${changeCase.constantCase(field.id)}, $value, $scopeType, $scopeCode);
        }
        return $this;
    }\
`;
}

function generateStringAccess(field) {
    let scope = 'SCOPE_DEFAULT';
    if (field.showInStore === '1') {
        scope = 'SCOPE_STORE';
    } else if (field.showInWebsite === '1') {
        scope = 'SCOPE_WEBSITE';
    }

    return `
    /**
     * Get the value of ${field.configPath}
     * 
     * @param string $scopeType
     * @param null $scopeCode
     * @return string|null
     */
    public function get${changeCase.pascalCase(field.id)}(string $scopeType = self::${scope}, $scopeCode = null): ?string
    {
        return $this->getValue(self::XML_${changeCase.constantCase(field.id)}, $scopeType, $scopeCode);
    }

    /**
     * Set or reset the value of ${field.configPath}
     * 
     * @param string|null $value - If null, the value is reset to the default value.
     * @param string $scopeType
     * @param null $scopeCode
     * @return self
     * @throws LocalizedException
     */
    public function set${changeCase.pascalCase(field.id)}($value, string $scopeType = self::SCOPE_DEFAULT, $scopeCode = null): self
    {
        if ($value === null) {
            $this->deleteValue(self::XML_${changeCase.constantCase(field.id)}, $scopeType, $scopeCode);
        } else {
            $this->setValue(self::XML_${changeCase.constantCase(field.id)}, $value, $scopeType, $scopeCode);
        }
        return $this;
    }\
`;
}

export function execute(data) {
    return `\
<?php
declare(strict_types=1);

namespace ${data.vendor}\\${data.module}\\Model;

use Magento\\Framework\\App\\Config\\ScopeConfigInterface;
use Magento\\Framework\\App\\Config\\Storage\\WriterInterface;
use Magento\\Framework\\App\\Cache\\TypeListInterface;
use Magento\\Framework\\Exception\\LocalizedException;
use Magento\\Config\\App\\Config\\Type\\System;
use Magento\\Store\\Model\\StoreManagerInterface;
use Magento\\Framework\\Serialize\\Serializer\\Json;

class Config
{
    public const SCOPE_STORE = \\Magento\\Store\\Model\\ScopeInterface::SCOPE_STORE;
    public const SCOPE_WEBSITE = \\Magento\\Store\\Model\\ScopeInterface::SCOPE_WEBSITE;
    public const SCOPE_DEFAULT = \\Magento\\Framework\\App\\ScopeInterface::SCOPE_DEFAULT;\
${ !data.config.fields.length ? '\n\n' : ('\n' + data.config.fields.map(field => `    protected const XML_${changeCase.constantCase(field.id)} = '${field.configPath}';`).join('\n') + "\n\n") }\
\
    /**
     * @var ScopeConfigInterface
     */
    private $configReader;

    /**
     * @var WriterInterface
     */
    private $configWriter;
${!data.includeClearCache ? "" : `
    /**
     * @var System
     */
    private $systemConfigType;\n`}\

    /**
     * @var TypeListInterface
     */
    private $cacheTypeList;

    /**
     * @var StoreManagerInterface
     */
    private $storeManager;

    /**
     * @var Json
     */
    private $serializer;

    /**
     * @param ScopeConfigInterface $configReader
     * @param WriterInterface $configWriter${!data.includeClearCache ? "" : `
     * @param System $systemConfigType`}
     * @param TypeListInterface $cacheTypeList
     * @param StoreManagerInterface $storeManager
     * @param Json $serializer
     */
    public function __construct(
        ScopeConfigInterface $configReader,
        WriterInterface $configWriter,${!data.includeClearCache ? "" : `
        System $systemConfigType,`}
        TypeListInterface $cacheTypeList,
        StoreManagerInterface $storeManager,
        Json $serializer
    ) {
        $this->configReader = $configReader;
        $this->configWriter = $configWriter;${!data.includeClearCache ? "" : `
        $this->systemConfigType = $systemConfigType;`}
        $this->cacheTypeList = $cacheTypeList;
        $this->storeManager = $storeManager;
        $this->serializer = $serializer;
    }
\
${ !data.config.fields.length ? '\n' : (data.config.fields.map(field => {
    if (field.backendModel !== undefined) {
        return generateSerializedAccess(field)
    } else if (field.type === 'multiselect') {
        return generateArrayAccess(field)
    } else {
        return generateStringAccess(field)
    }
}).join('\n') + "\n\n") }\
\
    /**
     * @param string $path
     * @param string $scopeType
     * @param string|integer|null $scopeCode
     * @return string|null
     */
    protected function getValue(string $path, string $scopeType = self::SCOPE_DEFAULT, $scopeCode = null): ?string
    {
        return $this->configReader->getValue($path, $scopeType, $scopeCode !== null ? $scopeCode : $this->getScopeCode($scopeType));
    }

    /**
     * @param string $path
     * @param string $value
     * @param string $scopeType
     * @param string|integer|null $scopeCode
     * @return self
     * @throws LocalizedException
     */
    protected function setValue(string $path, string $value, string $scopeType = self::SCOPE_DEFAULT, $scopeCode = null): self
    {
        $this->configWriter->save($path, $value, $scopeType, $scopeCode !== null ? $scopeCode : $this->getScopeCode($scopeType));
        $this->cacheTypeList->invalidate(\\Magento\\Framework\\App\\Cache\\Type\\Config::TYPE_IDENTIFIER);
        return $this;
    }

    /**
     * @param string $path
     * @param string $scopeType
     * @param string|integer|null $scopeCode
     * @return self
     * @throws LocalizedException
     */
    protected function deleteValue(string $path, string $scopeType = self::SCOPE_DEFAULT, $scopeCode = null): self
    {
        $this->configWriter->delete($path, $scopeType, $scopeCode !== null ? $scopeCode : $this->getScopeCode($scopeType));
        $this->cacheTypeList->invalidate(\\Magento\\Framework\\App\\Cache\\Type\\Config::TYPE_IDENTIFIER);
        return $this;
    }

    /**
     * @param string $path
     * @param string $scopeType
     * @param string|integer|null $scopeCode
     * @return bool
     */
    protected function isSetFlag(string $path, string $scopeType = self::SCOPE_DEFAULT, $scopeCode = null): bool
    {
        return $this->configReader->isSetFlag($path, $scopeType, $scopeCode !== null ? $scopeCode : $this->getScopeCode($scopeType));
    }

    /**
     * @param string $scopeType
     * @return string|null
     */
    private function getScopeCode(string $scopeType): ?string
    {
        if ($scopeType === self::SCOPE_STORE) {
            return (string)$this->storeManager->getStore()->getId();
        } elseif ($scopeType === self::SCOPE_WEBSITE) {
            return (string)$this->storeManager->getWebsite()->getId();
        }
        return null;
    }
${!data.includeClearCache ? "" : `
    /**
     * Clean the config cache to make new values immediately available to the application.
     * This method should be used with care!
     * It purges config and full_page caches and forces the current execution to reload the config.
     * This method should only be used when the new value is required to be immediately available to the application, in most cases
     * the cache should only be marked as invalid, which is the default behaviour.
     *
     * @example
     * \`\`\`php
     * $this->setValue('example/xml/path', 'example_value')->cleanCache();
     * \`\`\`
     *
     * @return self
     * @throws LocalizedException
     */
    public function cleanCache(): self
    {
        $this->systemConfigType->clean();
        return $this;
    }\n`}\
}\
`;
}