import React, { useState } from 'react';
import './ClubDirectory.css';
import { useNavigate } from 'react-router-dom';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaEnvelope,
  FaTiktok,
  FaGithub,
  FaUsers,
  FaCalendarAlt,
} from 'react-icons/fa';


const clubsData = [
  {
    name: 'Devclub',
    category: 'Technology',
    featured: true,
    rating: 4.8,
    members: 300,
    events: 8,
    description: 'A hub for passionate web developers, open-source contributors, and hackathon enthusiasts.',
    tags: ['Web Dev', 'Open Source', 'Hackathons'],
    social: ['linkedin', 'email'],
    email: 'devclub@university.com',
    bg: '#e0f2ff',
  },
  {
    name: 'Robotics Club',
    category: 'Technology',
    featured: true,
    rating: 4.9,
    members: 240,
    events: 6,
    description: 'Build intelligent robots and explore AI, IoT, and mechatronics hands-on.',
    tags: ['Hardware', 'AI', 'Mechatronics'],
    social: ['instagram', 'email'],
    email: 'robotics@university.com',
    bg: '#e8f5e9',
  },
  {
    name: 'Creators corner',
    category: 'Arts & Culture',
    featured: true,
    rating: 4.7,
    members: 180,
    events: 10,
    description: 'Celebrate creativity through visual arts, design, photography, and storytelling.',
    tags: ['Creativity', 'Media', 'Art'],
    social: ['youtube', 'instagram', 'email'],
    email: 'creatorscorner@university.com',
    bg: 'skyblue'
  },
  {
    name: 'Ensemble Club',
    category: 'Theatre',
    featured: true,
    rating: 4.7,
    members: 180,
    events: 10,
    description: 'A performing arts club for theatre, drama, music, and expressive dance lovers.',
    tags: ['Drama', 'Dance', 'music'],
    social: ['youtube', 'instagram', 'email'],
    email: 'ensembleclub@university.com',
    bg: '#fff8e1',
  },
  {
    name: 'Algonauts - CP Club',
    category: 'Technology',
    featured: true,
    rating: 5.0,
    members: 50,
    events: 4,
    description: 'Join coding battles, master DSA, and prep for ICPC with fellow problem solvers.',
    tags: ['CP', 'DSA', 'ICPC'],
    social: ['linkedin', 'email'],
    email: 'algonauts@university.com',
    bg: '#ede7f6',
  },
  {
    name: 'Orators',
    category: 'Public Speaking',
    featured: true,
    rating: 4.6,
    members: 100,
    events: 5,
    description: 'Sharpen your voice, debate ideas, and master the art of impactful communication.',
    tags: ['Debate', 'Public Speaking', 'Anchoring'],
    social: ['instagram', 'email'],
    email: 'oratos@university.com',
    bg: '#fff8e1',
  },
  {
    name: 'Trailblazers',
    category: 'Sports',
    featured: true,
    rating: 4.6,
    members: 315,
    events: 5,
    description: 'Unite with sports enthusiasts and compete in cricket, kabaddi, badminton, and more.',
    tags: ['Badminton', 'Cricket', 'Kabaddi'],
    social: ['instagram', 'email'],
    email: 'sports@university.com',
    bg: 'skyblue',
  },
  {
    name: 'Sharksphere',
    category: 'Entrepreneur',
    featured: true,
    rating: 5.0,
    members: 50,
    events: 4,
    description: 'Fuel your startup dreams with mentorship, pitch events, and business simulations.',
    tags: ['Startup', 'Business', 'Leadership'],
    social: ['linkedin', 'email'],
    email: 'sharksphere@university.com',
    bg: '#e8f5e9',
  },
  {
    name: 'Stellarquest - Astronomy',
    category: 'Space',
    featured: true,
    rating: 4.9,
    members: 240,
    events: 6,
    description: 'Explore the cosmos, study stars, and engage in space research and skywatching.',
    tags: ['Space', 'Research', 'Astrophysics'],
    social: ['instagram', 'email'],
    email: 'robotics@university.com',
    bg: '#e0f2ff',
  },
];


const getSocialIcon = (platform) => {
  switch (platform) {
    case 'facebook':
      return <FaFacebook />;
    case 'twitter':
      return <FaTwitter />;
    case 'instagram':
      return <FaInstagram />;
    case 'linkedin':
      return <FaLinkedin />;
    case 'youtube':
      return <FaYoutube />;
    case 'email':
      return <FaEnvelope />;
    case 'tiktok':
      return <FaTiktok />;
    case 'github':
      return <FaGithub />;
    default:
      return null;
  }
};

const ClubDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const navigate = useNavigate();

  const filteredClubs = clubsData.filter((club) => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All Categories' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'All Categories',
    'Technology',
    'Arts & Culture',
    'Public Speaking',
    'Sports',
    'Theatre',
    'Space',
    'Entrepreneur'
  ];

  return (
    <div className="club-page">
      <h1>
        <span>Campus</span> Clubs
      </h1>
      <p className="subtitle">
        Discover amazing communities, build lifelong friendships, and explore your passions with like-minded students
      </p>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search clubs, activities, or interests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button>Search</button>
      </div>

      <div className="category-tabs">
        {categories.map((cat, i) => (
          <div
            key={i}
            className={`tab ${selectedCategory === cat ? 'active-tab' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </div>
        ))}
      </div>

      <h2 className="featured-title">Featured Clubs</h2>
      <div className="club-card-list">
        {filteredClubs.map((club, index) => (
          <div className="club-card-featured" key={index} style={{ backgroundColor: club.bg }}>
            <div className="top-labels">
              <span className="category">{club.category}</span>
            </div>
            <h3>{club.name}</h3>
            <p className="desc">{club.description || ''}</p>
            <div className="stats">
              <span>
                <FaUsers /> {club.members} members
              </span>
              <span>
                <FaCalendarAlt /> {club.events} events
              </span>
            </div>
            <div className="tags">
              {club.tags.map((tag, i) => (
                <span key={i} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            <div className="actions">
              <button
                className="join-btn"
                onClick={() => navigate('/campus-events')}
              >
                Explore
              </button>

              <div className="socials">
                {club.social.map((s, i) => (
                  <a key={i} href="#" target="_blank" rel="noreferrer" className="social-icon">
                    {getSocialIcon(s)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClubDirectory;