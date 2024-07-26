import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { useTranslation } from 'react-i18next';
import { US, ES, IL, DE, SA, BR, RU, RO } from 'country-flag-icons/react/3x2';

const languages = [
    { code: 'en', shortName: 'EN', fullName: 'English', flag: <US /> },
    { code: 'es', shortName: 'ES', fullName: 'Spanish', flag: <ES /> },
    { code: 'he', shortName: 'HE', fullName: 'Hebrew', flag: <IL /> },
    { code: 'de', shortName: 'DE', fullName: 'German', flag: <DE /> },
    { code: 'ar', shortName: 'AR', fullName: 'Arabic', flag: <SA /> },
    { code: 'pt', shortName: 'PT', fullName: 'Portuguese', flag: <BR /> },
    { code: 'ru', shortName: 'RU', fullName: 'Russian', flag: <RU /> },
    { code: 'ro', shortName: 'RO', fullName: 'Romanian', flag: <RO /> },
];

export function LanguageToggle() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        debugger
        i18n.changeLanguage(lng);
    };

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button
                    variant="light"
                    size="md"
                    startContent={<div className="w-5 h-4 mr-1">{currentLanguage.flag}</div>}
                >
                    {currentLanguage.shortName}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Language selection"
                className="min-w-[120px]"
            >
                {languages.map((lang) => (
                    <DropdownItem
                        onClick={() => changeLanguage(lang.code)}
                        key={lang.code}
                        startContent={<div className="w-5 h-4 mr-2">{lang.flag}</div>}
                        className="py-2 text-sm"
                    >
                        {lang.fullName}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}