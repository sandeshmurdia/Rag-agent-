const axios = require('axios');

async function testChat() {
    try {
        // 1. Create a new session
        console.log('Creating new session...');
        const sessionResponse = await axios.post('http://localhost:3000/api/chat/session');
        const { sessionId } = sessionResponse.data;
        console.log('Session created:', sessionId);

        // Test queries
        const queries = [
            'What laptops are available?',
            'Show me products under $100',
            'Tell me about gaming accessories',
            'Compare kitchen appliances'
        ];

        for (const query of queries) {
            console.log('\nSending query:', query);
            const messageResponse = await axios.post(`http://localhost:3000/api/chat/${sessionId}`, {
                message: query
            });
            console.log('Response:', JSON.stringify(messageResponse.data, null, 2));
            
            // Wait a bit between queries
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Get chat history
        console.log('\nGetting chat history...');
        const historyResponse = await axios.get(`http://localhost:3000/api/chat/${sessionId}/history`);
        console.log('History:', JSON.stringify(historyResponse.data, null, 2));

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
            console.error('Response data:', error.response.data);
        } else if (error.request) {
            console.error('Request error:', error.request);
        }
        console.error('Error config:', error.config);
    }
}

testChat();