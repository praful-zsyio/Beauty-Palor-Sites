const Service = require('../models/Service');

// @desc    Get chatbot response
// @route   POST /api/chat
// @access  Public
exports.getChatResponse = async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const query = message.toLowerCase();
        let response = "";

        // Simple Rule-based Chatbot Intelligence
        if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
            response = "Hello! 🌸 Welcome to Kiran Beauty Salon Support. How can I help you today?";
        } else if (query.includes('price') || query.includes('cost') || query.includes('how much')) {
            const { services } = Service.findAll({ limit: 5 });
            const list = services.map(s => `${s.name}: ₹${s.price}`).join('\n');
            response = `Our pricing depends on the service. Here are some of our popular ones:\n${list}\n\nYou can see full details on our Services page!`;
        } else if (query.includes('book') || query.includes('appointment')) {
            response = "You can book an appointment directly from our 'Book Service' page. Just select your service, date, and time!";
        } else if (query.includes('location') || query.includes('where')) {
            response = "We are located in the heart of the city! Our full address is on the Contact page.";
        } else if (query.includes('hair')) {
            response = "We offer precision haircuts, styling, coloring, and keratin treatments. Would you like to see our Hair services?";
        } else if (query.includes('skin') || query.includes('facial')) {
            response = "Yes! We have classic facials, anti-aging treatments, and acne solutions tailored for your skin type.";
        } else if (query.includes('academy') || query.includes('course')) {
            response = "Visit our Academy section to see professional makeup and beauty courses with certification!";
        } else {
            response = "I'm still learning! 🌸 You can ask me about our services, pricing, or how to book an appointment. Alternatively, you can reach us via the Contact form!";
        }

        res.status(200).json({
            success: true,
            data: {
                reply: response,
                sender: 'bot',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        next(error);
    }
};
