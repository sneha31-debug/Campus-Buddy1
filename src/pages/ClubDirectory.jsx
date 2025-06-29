import React, { useState } from 'react';
import './ClubDirectory.css';
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
  FaClock,
  FaMapMarkerAlt,
  FaBookmark,
} from 'react-icons/fa';

const clubsData = [
  {
    name: 'Dev Club',
    category: 'Technology',
    featured: true,
    rating: 4.8,
    members: 300,
    events: 8,
    time: 'Wednesdays 7:00 PM',
    tags: ['Web Dev', 'Open Source', 'Hackathons'],
    social: ['github', 'linkedin', 'email'],
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
    time: 'Mondays 6:00 PM',
    tags: ['Hardware', 'AI', 'Mechatronics'],
    social: ['instagram', 'email'],
    email: 'robotics@university.com',
    bg: '#e8f5e9',
  },
  {
    name: 'Performing Arts Club',
    category: 'Arts & Culture',
    featured: true,
    rating: 4.7,
    members: 180,
    events: 10,
    time: 'Fridays 5:00 PM',
    tags: ['Drama', 'Dance', 'Theatre'],
    social: ['youtube', 'instagram', 'email'],
    email: 'performing@university.com',
    bg: '#fff8e1',
  },
  {
    name: 'Algonauts - CP Club',
    category: 'Technology',
    featured: true,
    rating: 5.0,
    members: 150,
    events: 4,
    time: 'Saturdays 10:00 AM',
    tags: ['CP', 'DSA', 'ICPC'],
    social: ['linkedin', 'email'],
    email: 'algonauts@university.com',
    bg: '#ede7f6',
  },
  {
    name: 'Oratos - Speaking Club',
    category: 'Arts & Culture',
    featured: true,
    rating: 4.6,
    members: 130,
    events: 5,
    time: 'Tuesdays 6:00 PM',
    tags: ['Debate', 'Public Speaking', 'Anchoring'],
    social: ['instagram', 'email'],
    email: 'oratos@university.com',
    bg: '#f3e5f5',
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
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [bookmarked, setBookmarked] = useState([]);

  const handleJoin = (clubName) => {
    setJoinedClubs((prev) =>
      prev.includes(clubName)
        ? prev.filter((name) => name !== clubName)
        : [...prev, clubName]
    );
  };

  const handleBookmark = (clubName) => {
    setBookmarked((prev) =>
      prev.includes(clubName)
        ? prev.filter((name) => name !== clubName)
        : [...prev, clubName]
    );
  };

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
    'Sports & Fitness',
    'Music & Performance',
    'Environment',
    'Business',
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
              <span className="bookmark" onClick={() => handleBookmark(club.name)}>
                <FaBookmark color={bookmarked.includes(club.name) ? '#9333ea' : '#555'} />
              </span>
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
            <div className="time-loc">
              <span>
                <FaClock /> {club.time}
              </span>
              <span>
                <FaMapMarkerAlt /> {club.location}
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
              <button className="join-btn" onClick={() => handleJoin(club.name)}>
                {joinedClubs.includes(club.name) ? 'Joined' : 'Join Club'}
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
