// FIS(IOC) → flag-icons (alpha-2, lowercase)
export const fisToAlpha2 = (fisCode: string): string | null => {
    const code = fisCode.toUpperCase();

    const fisToAlpha2Map: Record<string, string> = {
        // Europe
        'GER': 'de', 'POL': 'pl', 'SLO': 'si', 'SUI': 'ch', 'AUT': 'at',
        'CZE': 'cz', 'SVK': 'sk', 'HUN': 'hu', 'ROU': 'ro', 'BUL': 'bg',
        'CRO': 'hr', 'SRB': 'rs', 'BIH': 'ba', 'MNE': 'me', 'MKD': 'mk',
        'ALB': 'al', 'GRE': 'gr', 'TUR': 'tr', 'NOR': 'no', 'SWE': 'se',
        'FIN': 'fi', 'DEN': 'dk', 'ISL': 'is', 'EST': 'ee', 'LAT': 'lv',
        'LTU': 'lt', 'BLR': 'by', 'UKR': 'ua', 'MDA': 'md', 'RUS': 'ru',
        'FRA': 'fr', 'ITA': 'it', 'ESP': 'es', 'POR': 'pt', 'AND': 'ad',
        'LIE': 'li', 'MON': 'mc', 'BEL': 'be', 'NED': 'nl', 'LUX': 'lu',
        'GBR': 'gb', 'IRL': 'ie', 'MLT': 'mt', 'CYP': 'cy',

        // Asia
        'JPN': 'jp', 'KOR': 'kr', 'CHN': 'cn', 'TPE': 'tw', 'HKG': 'hk',
        'MAC': 'mo', 'MGL': 'mn', 'KAZ': 'kz', 'KGZ': 'kg', 'TJK': 'tj',
        'UZB': 'uz', 'TKM': 'tm', 'AFG': 'af', 'PAK': 'pk', 'IND': 'in',
        'SRI': 'lk', 'BAN': 'bd', 'MYA': 'mm', 'THA': 'th', 'LAO': 'la',
        'VIE': 'vn', 'CAM': 'kh', 'MAS': 'my', 'SIN': 'sg', 'BRU': 'bn',
        'PHI': 'ph', 'INA': 'id', 'TLS': 'tl', 'NEP': 'np', 'BHU': 'bt',

        // Americas
        'USA': 'us', 'CAN': 'ca', 'MEX': 'mx', 'GUA': 'gt', 'BLZ': 'bz',
        'HON': 'hn', 'SLV': 'sv', 'NIC': 'ni', 'CRC': 'cr', 'PAN': 'pa',
        'CUB': 'cu', 'JAM': 'jm', 'HAI': 'ht', 'DOM': 'do', 'PUR': 'pr',
        'VEN': 've', 'COL': 'co', 'GUY': 'gy', 'SUR': 'sr', 'BRA': 'br',
        'ECU': 'ec', 'PER': 'pe', 'BOL': 'bo', 'CHI': 'cl', 'ARG': 'ar',
        'URU': 'uy', 'PAR': 'py',

        // Africa
        'EGY': 'eg', 'LBY': 'ly', 'TUN': 'tn', 'ALG': 'dz', 'MAR': 'ma',
        'SUD': 'sd', 'SSD': 'ss', 'ETH': 'et', 'ERI': 'er', 'DJI': 'dj',
        'SOM': 'so', 'KEN': 'ke', 'UGA': 'ug', 'TAN': 'tz', 'RWA': 'rw',
        'BDI': 'bi', 'COD': 'cd', 'CAF': 'cf', 'CHA': 'td', 'CMR': 'cm',
        'GAB': 'ga', 'CGO': 'cg', 'STP': 'st', 'GNQ': 'gq', 'NGA': 'ng',
        'BEN': 'bj', 'TOG': 'tg', 'GHA': 'gh', 'CIV': 'ci', 'LBR': 'lr',
        'SLE': 'sl', 'GIN': 'gn', 'GNB': 'gw', 'SEN': 'sn', 'GAM': 'gm',
        'MLI': 'ml', 'BFA': 'bf', 'NER': 'ne', 'ZAM': 'zm', 'ZIM': 'zw',
        'BOT': 'bw', 'NAM': 'na', 'ZAF': 'za', 'LES': 'ls', 'SWZ': 'sz',
        'MDG': 'mg', 'MUS': 'mu', 'SEY': 'sc', 'COM': 'km', 'MWI': 'mw',
        'MOZ': 'mz', 'AGO': 'ao', 'ZMB': 'zm',

        // Oceania
        'AUS': 'au', 'NZL': 'nz', 'PNG': 'pg', 'SOL': 'sb', 'VAN': 'vu',
        'FIJ': 'fj', 'TON': 'to', 'SAM': 'ws', 'TUV': 'tv', 'KIR': 'ki',
        'NAU': 'nr', 'PLW': 'pw', 'FSM': 'fm', 'MHL': 'mh', 'COK': 'ck',
        'NIU': 'nu', 'TKL': 'tk', 'WLF': 'wf', 'PYF': 'pf', 'NCL': 'nc',
        'VUT': 'vu', 'SLB': 'sb', 'IDN': 'id', 'MYS': 'my',

        // Special cases
        'KOS': 'xk', // Kosovo
        'TWN': 'tw', // Taiwan
        'ISV': 'vi', // US Virgin Islands
        'ARU': 'aw', // Aruba
        'AHO': 'an', // Netherlands Antilles (historical)
    };

    return fisToAlpha2Map[code] || null;
};
