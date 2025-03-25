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
            [index]: value === 'yes',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const result = await axios.post('/api/analysis/questionnaire', 
                { responses }, 
                { headers: { 'x-auth-token': token } }
            );

            if (result.data.shouldProceed) {
                const proceed = window.confirm(
                    `Based on your responses, there's a ${Math.round(result.data.probability * 100)}% 
                     initial probability of dyslexia. Would you like to proceed with a detailed assessment?`
                );
                if (proceed) {
                    navigate('/video-recording');
                }
            } else {
                navigate('/video-recording');
            }
        } catch (err) {
            alert('Submission failed: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 to-purple-400 px-4">
            <div className="max-w-2xl w-full bg-white p-8 rounded-3xl shadow-xl transition-transform duration-300 transform mt-4 mb-4">
                <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
                    Could it be Dyslexia?
                </h1>
                <p className="text-center text-gray-600 mb-6">Select 'Yes' for the statements that apply.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {questions.map((question, index) => (
                        <div key={index} className="p-3 bg-white shadow-md rounded-md transition transform hover:-translate-y-1 hover:shadow-lg">
                            <label className="block text-md font-medium text-gray-700 mb-2">{question}</label>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name={`question-${index}`}
                                        value="yes"
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        className="form-radio text-blue-600"
                                    />
                                    <span className="ml-2">Yes</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name={`question-${index}`}
                                        value="no"
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        className="form-radio text-blue-600"
                                    />
                                    <span className="ml-2">No</span>
                                </label>
                            </div>
                        </div>
                    ))}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Questionnaire;
