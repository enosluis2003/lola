import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { sessionId, telefone } = req.body;
    
    if (!sessionId || !telefone) {
        return res.status(400).json({ error: 'Session ID e Telefone são obrigatórios' });
    }

    const publicKey = "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAszE+xAKVB9HRarr6/uHYYAX/RdD6KGVIGlHv98QKDIH26ldYJQ7zOuo9qEscO0M1psSPe/67AWYLEXh13fbtcSKGP6WFjT9OY6uV5ykw9508x1sW8UQ4ZhTRNrlNsKizE/glkBfcF2lwDXJGQennwgickWz7VN+AP/1c4DnMDfcl8iVIDlsbudFoXQh5aLCYl+XOMt/vls5a479PLMkPcZPOgMTCYTCE6ReX3KD2aGQ62uiu2T4mK+7Z6yvKvhPRF2fTKI+zOFWly//IYlyB+sde42cIU/588msUmgr3G9FYyN2vKPVy/MhIZpiFyVc3vuAAJ/mzue5p/G329wzgcz0ztyluMNAGUL9A4ZiFcKOebT6y6IgIMBeEkTwyhsxRHMFXlQRgTAufaO5hiR/usBMkoazJ6XrGJB8UadjH2m2+kdJIieI4FbjzCiDWKmuM58rllNWdBZK0XVHNsxmBy7yhYw3aAIhFS0fNEuSmKTfFpJFMBzIQYbdTgI28rZPAxVEDdRaypUqBMCq4OstCxgGvR3Dy1eJDjlkuiWK9Y9RGKF8HOI5a4ruHyLheddZxsUihziPF9jKTknsTZtF99eKTIjhV7qfTzxXq+8GGoCEABIyu26LZuL8X12bFqtwLAcjfjoB7HlRHtPszv6PJ0482ofWmeH0BE8om7VrSGxsCAwEAAQ==";

    try {
        const pemKey = `-----BEGIN PUBLIC KEY-----\n${publicKey.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
        
        const encryptedSessionId = crypto.publicEncrypt(
            { key: pemKey, padding: crypto.constants.RSA_PKCS1_PADDING }, 
            Buffer.from(sessionId)
        ).toString('base64');

        // PAYLOAD ATUALIZADO PARA MOÇAMBIQUE
        const payload = {
            input_Amount: "10",
            input_Country: "MOZ", // Moçambique
            input_Currency: "MZN", // Meticais
            input_CustomerMSISDN: telefone, // Número recebido do site
            input_ServiceProviderCode: "000000", // Shortcode de testes
            input_ThirdPartyConversationID: "asv02e5958774f7ba228d83d0d689761",
            input_TransactionReference: "T1234C",
            input_PurchasedItemsDesc: "Sapatos"
        };

        // URL ATUALIZADA PARA MOÇAMBIQUE (vodacomMZ)
        const response = await fetch('https://openapi.m-pesa.com/sandbox/ipg/v2/vodacomMZ/c2bPayment/multiStage/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${encryptedSessionId}`,
                'Content-Type': 'application/json',
                'Origin': '*'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}