'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, FileText, Mail, Github } from 'lucide-react';
import { cn } from '@/lib/utils';

type Language = 'pl' | 'en' | 'cs' | 'sl';


const languageNames = {
    pl: 'Polski',
    en: 'English',
    cs: 'Čeština',
    sl: 'Ślōnskŏ gŏdka'
};

const content = {
    pl: { title: 'Polityka Prywatności i Regulamin', privacy: { title: 'Polityka Prywatności', sections: [{ title: 'Zbierane dane', content: 'Zbieramy tylko nick gracza oraz adres IP (przez logi serwera). Nie wymagamy rejestracji ani podawania danych osobowych.' }, { title: 'Cel zbierania', content: 'Dane służą wyłącznie do działania gry - identyfikacji gracza, prowadzenia rankingu i zapewnienia płynnej rozgrywki.' }, { title: 'Udostępnianie', content: 'Nie udostępniamy zebranych danych osobom trzecim. Nie prowadzimy analiz marketingowych ani nie sprzedajemy danych.' }, { title: 'Kontakt', content: 'Jeśli chcesz usunąć swoje dane, skontaktuj się z nami:' }] }, terms: { title: 'Regulamin', sections: [{ title: 'Charakter gry', content: 'SJ Draft to darmowa gra online o charakterze rozrywkowym. Nie odzwierciedla rzeczywistych wyników sportowych - skoczkowie są fikcyjni.' }, { title: 'Zasady użytkowania', content: 'Zabrania się cheatowania, spamowania, używania wulgaryzmów oraz wszelkich działań zakłócających rozgrywkę innych graczy.' }, { title: 'Odpowiedzialność', content: 'Gra jest udostępniana "as is" - nie ponosimy odpowiedzialności za błędy, przerwy w działaniu czy utratę postępów w grze.' }, { title: 'Własność intelektualna', content: 'Logo, nazwa i grafika SJ Draft pozostają własnością autora. Zabrania się ich nieautoryzowanego wykorzystywania.' }, { title: 'Aktualizacje', content: 'Warunki mogą być aktualizowane. Wersja aktualna jest zawsze dostępna na stronie gry.' }] }, contact: 'Kontakt w sprawach dotyczących gry:' }, en: { title: 'Privacy Policy and Terms of Service', privacy: { title: 'Privacy Policy', sections: [{ title: 'Data collected', content: 'We collect only player nickname and IP address (through server logs). No registration or personal data required.' }, { title: 'Purpose', content: 'Data is used solely for game functionality - player identification, ranking system and ensuring smooth gameplay.' }, { title: 'Sharing', content: 'We do not share collected data with third parties. We do not conduct marketing analysis or sell data.' }, { title: 'Contact', content: 'If you want to delete your data, contact us:' }] }, terms: { title: 'Terms of Service', sections: [{ title: 'Game nature', content: 'SJ Draft is a free online entertainment game. It does not reflect real sports results - jumpers are fictional.' }, { title: 'Usage rules', content: 'Cheating, spamming, using profanity and any actions disrupting other players\' gameplay are prohibited.' }, { title: 'Liability', content: 'Game is provided "as is" - we are not responsible for bugs, service interruptions or loss of game progress.' }, { title: 'Intellectual property', content: 'SJ Draft logo, name and graphics remain property of the author. Unauthorized use is prohibited.' }, { title: 'Updates', content: 'Terms may be updated. Current version is always available on the game website.' }] }, contact: 'Contact for game-related matters:' }, cs: { title: 'Zásady ochrany osobních údajů a Podmínky služby', privacy: { title: 'Zásady ochrany osobních údajů', sections: [{ title: 'Shromažďované údaje', content: 'Shromažďujeme pouze přezdívku hráče a IP adresu (prostřednictvím serverových logů). Registrace ani osobní údaje nejsou vyžadovány.' }, { title: 'Účel', content: 'Údaje slouží výhradně pro funkčnost hry - identifikaci hráče, žebříček a zajištění plynulé hry.' }, { title: 'Sdílení', content: 'Nesdílíme shromážděné údaje s třetími stranami. Neprovádíme marketingové analýzy ani neprodáváme data.' }, { title: 'Kontakt', content: 'Pokud chcete smazat své údaje, kontaktujte nás:' }] }, terms: { title: 'Podmínky služby', sections: [{ title: 'Povaha hry', content: 'SJ Draft je bezplatná online zábavní hra. Neodráží skutečné sportovní výsledky - skokani jsou fiktivní.' }, { title: 'Pravidla používání', content: 'Zakazuje se podvádění, spamování, používání vulgárních výrazů a jakékoli akce narušující hru ostatních hráčů.' }, { title: 'Odpovědnost', content: 'Hra je poskytována "tak jak je" - neodpovídáme za chyby, výpadky služby nebo ztrátu herního pokroku.' }, { title: 'Duševní vlastnictví', content: 'Logo, název a grafika SJ Draft zůstávají majetkem autora. Neoprávněné použití je zakázáno.' }, { title: 'Aktualizace', content: 'Podmínky mohou být aktualizovány. Aktuální verze je vždy dostupná na herní stránce.' }] }, contact: 'Kontakt pro záležitosti týkající se hry:' }, sl: {
        title: 'Polityka prziwatności i regulōmin',
        privacy: {
            title: 'Polityka prziwatności',
            sections: [
                {
                    title: 'Zbiōr danych',
                    content:
                        'Zbiyrōmy ino nik gracza i adres IP (przez logi serwera). Niy trza rejstracyje ani podowaniŏ ôsobistych danych.',
                },
                {
                    title: 'Cyl zbiyranio',
                    content:
                        'Dane służōm wyłōncznie do dziyłanio gry: idyntyfikacyje gracza, prowadzyniŏ rankingu i zapełniyniŏ płynnyj rozgrywki.',
                },
                {
                    title: 'Udostympniōwanie',
                    content:
                        'Niy udostympniōmy danych postronnym. Niy robiy my analiz marketingowych i niy sprzedajymy danych.',
                },
                {
                    title: 'Kontakt',
                    content: 'Jak chcesz skasować swoje dane, skōntaktuj sie z nami:',
                },
            ],
        },
        terms: {
            title: 'Regulōmin',
            sections: [
                {
                    title: 'Charakter gry',
                    content:
                        'SJ Draft to darmowo gra ônline do rozrywkōw. Niy ôdzwierciedlo prawdziwych wynikōw sportowych — skoczki sōm wymyślōne.',
                },
                {
                    title: 'Zasady używanio',
                    content:
                        'Zabraniŏ sie cheatowaniŏ, spamowaniŏ, używaniŏ wulgaryzmōw i wszelakich dziyłań, co przeszkadzajōm inkszym graczōm.',
                },
                {
                    title: 'Ôdpowiydzialność',
                    content:
                        'Gra je „as is” — niy ponoszymy ôdpowiydzialności za błyndy, przestoje abo ôtratã postympōw.',
                },
                {
                    title: 'Włosność intelektualno',
                    content:
                        'Logo, miano i grafika SJ Draft ôstoja włosnościōm autōra. Niy wolno ich używać bez zgody.',
                },
                {
                    title: 'Aktualizacyje',
                    content:
                        'Warōnki mogōm być zmiyniōne. Aktuolno wersyjo je dycki dostympno na strōnie gry.',
                },
            ],
        },
        contact: 'Kontakt we sprawach gry:',
    },
};

// NOTE: for brevity above content sections are kept as-is in the real file —
// replace the `/* ...unchanged... */` placeholders with the full objects from your original file.

function Flag({ lang }: { lang: Language }) {
    // small inline SVGs for clean flags; Silesian flag is simple blue/yellow bicolor here
    if (lang === 'pl') return (
        <svg className="w-6 h-4" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect width="24" height="8" y="0" fill="#ffffff" />
            <rect width="24" height="8" y="8" fill="#dc143c" />
        </svg>
    );
    if (lang === 'en') return (
        <svg className="w-6 h-4" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect width="60" height="30" fill="#012169" />
            <path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
            <path d="M0 0L60 30M60 0L0 30" stroke="#c8102e" strokeWidth="4" />
            <path d="M30 0V30M0 15H60" stroke="#fff" strokeWidth="10" />
            <path d="M30 0V30M0 15H60" stroke="#c8102e" strokeWidth="6" />
        </svg>
    );
    if (lang === 'cs') return (
        <svg className="w-6 h-4" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect width="24" height="16" fill="#ffffff" />
            <rect width="24" height="8" y="8" fill="#d7141a" />
            <polygon points="0,0 10,8 0,16" fill="#11457e" />
        </svg>
    );
    // sl — śląski: simple blue (top) / yellow (bottom) bicolor
    return (
        <svg className="w-6 h-4" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect width="24" height="8" y="0" fill="#0047AB" />
            <rect width="24" height="8" y="8" fill="#FFD700" />
        </svg>
    );
}

export default function LegalPage() {
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('pl');
    const currentContent = content[selectedLanguage] as any;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white animate-in fade-in duration-500">
            {/* Header */}
            <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                                {/* rounded logo as requested */}
                                <a
                                    href="/"
                                    className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center hover:opacity-90 transition cursor-pointer"
                                >
                                    <img
                                        src="/assets/sjdraft.jpg"
                                        alt="SJ Draft"
                                        className="w-16 h-16 object-contain"
                                    />
                                </a>


                            </div>
                            <div>
                                <div className="text-lg font-bold">Ski Jump Draft</div>
                            </div>
                        </div>

                        {/* Language Selector with flags */}
                        <div className="flex gap-2 items-center">
                            {(['pl', 'en', 'cs', 'sl'] as Language[]).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => setSelectedLanguage(lang)}
                                    className={cn(
                                        'flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all',
                                        selectedLanguage === lang
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-transparent border border-slate-700/30 text-slate-300 hover:bg-slate-800/40'
                                    )}
                                >
                                    <Flag lang={lang} />
                                    <span>{languageNames[lang]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* removed big centered title + last-updated as requested */}

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Privacy Policy */}
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 group animate-in slide-in-from-left-4 duration-700">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors duration-300">
                                    <Shield className="w-5 h-5 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
                                </div>
                                <h2 className="text-2xl font-bold text-green-400 group-hover:text-green-300 transition-colors duration-300">
                                    {currentContent.privacy.title}
                                </h2>
                            </div>

                            <div className="space-y-6">
                                {currentContent.privacy.sections.map((section: any, index: number) => (
                                    <div key={index} className="group/section">
                                        <h3 className="text-lg font-semibold text-slate-200 mb-2 group-hover/section:text-slate-100 transition-colors duration-200">
                                            {section.title}
                                        </h3>
                                        <p className="text-slate-300 leading-relaxed group-hover/section:text-slate-200 transition-colors duration-200">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Terms of Service */}
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 group animate-in slide-in-from-right-4 duration-700">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-300">
                                    <FileText className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                                </div>
                                <h2 className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                                    {currentContent.terms.title}
                                </h2>
                            </div>

                            <div className="space-y-6">
                                {currentContent.terms.sections.map((section: any, index: number) => (
                                    <div key={index} className="group/section">
                                        <h3 className="text-lg font-semibold text-slate-200 mb-2 group-hover/section:text-slate-100 transition-colors duration-200">
                                            {section.title}
                                        </h3>
                                        <p className="text-slate-300 leading-relaxed group-hover/section:text-slate-200 transition-colors duration-200">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Minimal contact card */}
                <Card className="mt-8 bg-slate-800/40 border-slate-700 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-700 delay-300">
                    <div className="p-4 text-center">
                        <div className="text-sm font-medium text-slate-200 mb-2">{currentContent.contact}</div>
                        <a
                            href="https://github.com/Ski-Jump-Draft"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-700/70 hover:bg-slate-700 text-sm"
                        >
                            <Github className="w-4 h-4" />
                            <span>GitHub</span>
                        </a>
                    </div>
                </Card>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <Separator className="bg-slate-700 mb-6" />
                    <p className="text-slate-500 text-sm">
                        © 2025 SJ Draft. {selectedLanguage === 'pl' && 'Wszystkie prawa zastrzeżone.'}
                        {selectedLanguage === 'en' && 'All rights reserved.'}
                        {selectedLanguage === 'cs' && 'Všechna práva vyhrazena.'}
                        {selectedLanguage === 'sl' && 'Wszystkie prawa zastrzeżone.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
