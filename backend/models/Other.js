const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: String,
        image: { type: String, required: true },
        category: {
            type: String,
            enum: ['Hair', 'Skin', 'Nails', 'Makeup', 'Bridal', 'Before-After', 'Academy'],
        },
        isFeatured: { type: Boolean, default: false },
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        tags: [String],
    },
    { timestamps: true }
);

const testimonialSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, required: true },
        review: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        service: String,
        image: String,
        isApproved: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: String,
        duration: String,
        fee: Number,
        syllabus: [String],
        certificate: { type: Boolean, default: true },
        mode: {
            type: String,
            enum: ['offline', 'online', 'hybrid'],
            default: 'offline',
        },
        image: String,
        isActive: { type: Boolean, default: true },
        intake: String,
        eligibility: String,
    },
    { timestamps: true }
);

const Gallery = mongoose.model('Gallery', gallerySchema);
const Testimonial = mongoose.model('Testimonial', testimonialSchema);
const Course = mongoose.model('Course', courseSchema);

module.exports = { Gallery, Testimonial, Course };
