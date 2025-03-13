import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Questionnaire = () => {
    const [responses, setResponses] = useState({});
    const navigate = useNavigate();

    const questions = [
        "Difficulty acquiring and using oral and written language.",
        "Difficulty in phonological awareness, including segmenting, blending, and manipulating sounds in words.",
        "Difficulty mastering the alphabetical principle and basic decoding skills (converting symbols to sounds).",
        "Slow, inaccurate, laboured reading (lacking accuracy and/or fluency).",
        "Difficulty acquiring age-appropriate sight word recognition skills (visual coding).",
        "Difficulty learning to spell accurately.",
        "Difficulty learning and retaining multi-syllabic vocabulary.",
        "Limited reading comprehension due to weak decoding and/or word recognition and fluency skills.",
        "Oral language skills are often stronger than written language skills.",
        "Difficulty with spellings or forgetting learnt words quickly.",
    ];

    const handleChange = (index, value) => {
        setResponses((prev) => ({
            ...prev,
            [index]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/analysis/questionnaire', { responses }, {
                headers: { 'x-auth-token': token },
            });
            navigate('/upload');
        } catch (err) {
            alert('Submission failed: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 to-purple-400 px-4">
            <div className="max-w-2xl w-full bg-white p-8 rounded-3xl shadow-xl transition-transform duration-300 transform  mt-4 mb-4">
                <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
                    Could it be Dyslexia?
                </h1>
                <p className="text-center text-gray-600 mb-6">Select 'Yes' for the statements that describe your child.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {questions.map((question, index) => (
                        <div key={index} className="p-3 bg-white shadow-md rounded-md transition transform hover:-translate-y-2 hover:shadow-lg">
                            <label className="block text-md font-medium text-gray-700">{question}</label>
                            <div className="flex justify-center space-x-6 mt-3">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`q${index}`}
                                        value="Yes"
                                        onChange={() => handleChange(index, "Yes")}
                                        required
                                        className="hidden peer"
                                    />
                                    <div className="w-6 h-6 border-2 border-blue-500 rounded-full flex items-center justify-center peer-checked:bg-blue-500 peer-checked:border-blue-700 transition-all duration-200">
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                    <span className="text-gray-700 font-semibold">Yes</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`q${index}`}
                                        value="No"
                                        onChange={() => handleChange(index, "No")}
                                        required
                                        className="hidden peer"
                                    />
                                    <div className="w-6 h-6 border-2 border-red-500 rounded-full flex items-center justify-center peer-checked:bg-red-500 peer-checked:border-red-700 transition-all duration-200">
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                    <span className="text-gray-700 font-semibold">No</span>
                                </label>
                            </div>
                        </div>
                    ))}
                    <button
                        type="submit"
                        className="w-full h-12 px-4 border border-transparent rounded-full shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Questionnaire;
