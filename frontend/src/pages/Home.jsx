import React, { useState } from 'react';
import { Calendar, Users, Heart, Zap, Star, TrendingUp, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function CampusBuddyHomepage() {
  const [hoveredStat, setHoveredStat] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const campusStats = [
    { 
      icon: <Calendar className="home-stat-icon" />, 
      number: "6", 
      label: "Active Events",
      colorClass: "home-stat-blue",
      description: "Join exciting events happening this week"
    },
    { 
      icon: <Users className="home-stat-icon" />, 
      number: "25+", 
      label: "Active Clubs",
      colorClass: "home-stat-green",
      description: "Connect with diverse student organizations"
    },
    { 
      icon: <Heart className="home-stat-icon" />, 
      number: "500+", 
      label: "Student Members",
      colorClass: "home-stat-yellow",
      description: "Growing community of active students"
    }
  ];

  const features = [
    {
      icon: <Users className="feature-icon" />,
      title: "Connect & Network",
      description: "Meet like-minded students, join clubs, and build lasting friendships through shared interests and activities.",
      colorClass: "feature-blue"
    },
    {
      icon: <Zap className="feature-icon" />,
      title: "Stay Updated",
      description: "Never miss out on exciting events, workshops, competitions, and activities happening around campus.",
      colorClass: "feature-green"
    },
    {
      icon: <Star className="feature-icon" />,
      title: "Grow & Learn",
      description: "Participate in workshops, hackathons, and skill-building events to enhance your academic and personal growth.",
      colorClass: "feature-yellow"
    }
  ];

  return (
    <div className="campus-buddy-container">
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-title-container">
            <div className="hero-icon">
              <Calendar className="hero-calendar" />
            </div>
            <h1 className="hero-title">
              Welcome to <span className="title-highlight">Campus-Buddy</span>
            </h1>
          </div>
          
          <div className="hero-subtitle-container">
            <Star className="subtitle-star" />
            <p className="hero-subtitle">Your gateway to campus life</p>
            <Star className="subtitle-star" />
          </div>

          <p className="hero-description">
            Discover amazing events, connect with fellow students, and make the most of 
            your campus experience. Whether you're looking to learn, compete, or just have 
            fun - we've got you covered! 🎉
          </p>
          <Link to = "/campusevents">
            <button className="hero-cta-btn">
              <Calendar className="cta-icon" />
              <span>Explore Events</span>
              <TrendingUp className="cta-arrow" />
            </button>
          </Link>
        </div>
      </section>
      <section className="home-stats-section">
        <div className="home-stats-container">
          <div className="home-stats-header">
            <h2 className="home-stats-title">Campus at a Glance</h2>
            <p className="home-stats-subtitle">See what's happening on campus right now!</p>
          </div>

          <div className="home-stats-grid">
            {campusStats.map((stat, index) => (
              <div 
                key={index}
                className={`home-stat-card ${stat.colorClass} ${hoveredStat === index ? 'home-stat-card-hovered' : ''}`}
                onMouseEnter={() => setHoveredStat(index)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <div className={`home-stat-icon-container ${hoveredStat === index ? 'home-stat-icon-hovered' : ''}`}>
                  {stat.icon}
                </div>
                
                <div className={`home-stat-number ${hoveredStat === index ? 'home-stat-number-hovered' : ''}`}>
                  {stat.number}
                </div>
                
                <h3 className="home-stat-label">{stat.label}</h3>
                
                <div className={`home-stat-description ${hoveredStat === index ? 'home-stat-description-visible' : ''}`}>
                  <p>{stat.description}</p>
                </div>

                {hoveredStat === index && (
                  <div className="home-stat-trending-icon">
                    <TrendingUp className="home-trending-icon" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="features-section">
        <div className="features-container">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`feature-card ${feature.colorClass} ${hoveredFeature === index ? 'feature-card-hovered' : ''}`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`feature-icon-container ${hoveredFeature === index ? 'feature-icon-hovered' : ''}`}>
                  {feature.icon}
                </div>
                
                <h3 className={`feature-title ${hoveredFeature === index ? 'feature-title-hovered' : ''}`}>
                  {feature.title}
                </h3>
                
                <p className="feature-description">{feature.description}</p>

                {hoveredFeature === index && (
                  <>
                    <div className="feature-gradient-overlay"></div>
                    <div className="feature-star-icon">
                      <Star className="star-icon" />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to dive into campus life?</h2>
          <p className="cta-description">
            Browse upcoming events, RSVP to activities that interest you, and start 
            building your campus network today!
          </p>
          <Link to = "/campusevents">
          <button className="cta-btn">
            <TrendingUp className="cta-btn-icon" />
            <span>Get Started</span>
          </button>
          </Link>
        </div>
      </section>
    </div>
  );
}