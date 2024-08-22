function normalizeUrl(address) {
    // Add protocol if missing
    if (!/^https?:\/\//i.test(address)) {
        address = 'https://' + address;
    }

    // Add 'www.' if missing and the address doesn't have subdomain
    const urlWithoutProtocol = address.replace(/^https?:\/\//i, '');
    if (!urlWithoutProtocol.includes('.') && !urlWithoutProtocol.startsWith('www.')) {
        address = address.replace(/^https?:\/\//i, 'https://www.');
    } else if (!urlWithoutProtocol.startsWith('www.') && !urlWithoutProtocol.includes('/')) {
        // Check if it already has 'www.' or is a subdomain, if not add it
        address = address.replace(/^https?:\/\//i, 'https://www.');
    }

    // Add '.com' if missing and the address doesn't have a top-level domain
    if (!urlWithoutProtocol.includes('.')) {
        address += '.com';
    }

    return address;
}

module.exports = {
    normalizeUrl
};