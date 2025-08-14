import React, { useState, useEffect } from 'react';
import { Megaphone, Github, Linkedin, Twitter, Instagram, Users } from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Event, Announcement } from '../../types';
import AnnouncementCard from './AnnouncementCard';
import EventCard from './EventCard';
import ResourcesSection from './ResourcesSection';

const JuniorDashboard: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'Lead Developer',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
      social: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com'
      }
    },
    {
      name: 'Sarah Chen',
      role: 'UI/UX Designer',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
      social: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        instagram: 'https://instagram.com'
      }
    },
    {
      name: 'Mike Rodriguez',
      role: 'Backend Engineer',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
      social: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com'
      }
    },
    {
      name: 'Emily Davis',
      role: 'Project Manager',
      image: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=300',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        instagram: 'https://instagram.com'
      }
    }
  ];

  useEffect(() => {
    fetchAnnouncements();
    fetchEvents();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const announcementList: Announcement[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }));
      // Sort by priority after fetching to avoid composite index requirement
      const sortedAnnouncements = announcementList.sort((a, b) => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        return bPriority - aPriority;
      });
      setAnnouncements(sortedAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      const eventList: Event[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate()
      }));
      setEvents(eventList);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Announcements Section */}
        <section className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Megaphone className="h-8 w-8 text-blue-500" />
            <h2 className="text-3xl font-bold text-white">Latest Announcements</h2>
          </div>
          {announcements.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No announcements yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {announcements.map(announcement => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
          )}
        </section>

        {/* Resources Section */}
        <ResourcesSection />

        {/* Built By Section */}
        <section className="mb-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Built By Our Amazing Team</h2>
            <p className="text-gray-400 text-lg">Meet the talented individuals who made this project possible</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={member.name}
                className="group relative bg-gray-800 rounded-2xl p-6 hover:bg-gray-750 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-500 group-hover:ring-purple-500 transition-all duration-300"
                    />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-gray-400">{member.role}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  {member.social.github && (
                    <a
                      href={member.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors group-hover:scale-110 transform"
                    >
                      <Github className="h-5 w-5 text-gray-300 hover:text-white" />
                    </a>
                  )}
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-700 rounded-lg hover:bg-blue-600 transition-colors group-hover:scale-110 transform"
                    >
                      <Linkedin className="h-5 w-5 text-gray-300 hover:text-white" />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a
                      href={member.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-700 rounded-lg hover:bg-blue-400 transition-colors group-hover:scale-110 transform"
                    >
                      <Twitter className="h-5 w-5 text-gray-300 hover:text-white" />
                    </a>
                  )}
                  {member.social.instagram && (
                    <a
                      href={member.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-700 rounded-lg hover:bg-pink-600 transition-colors group-hover:scale-110 transform"
                    >
                      <Instagram className="h-5 w-5 text-gray-300 hover:text-white" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Events Section */}
        {/* Task Management Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Task Management</h2>
            <p className="text-gray-400">View assigned tasks and progress</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-center">
              <p className="text-gray-400 mb-4">Check your assigned tasks and deadlines</p>
              <a
                href="/tasks"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Tasks
              </a>
            </div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Event Feedback</h2>
            <p className="text-gray-400">Share your experience and suggestions</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-center">
              <p className="text-gray-400 mb-4">Help us improve by providing feedback on events</p>
              <a
                href="/feedback"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Give Feedback
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 rounded-xl p-8 mt-12">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <Users className="h-8 w-8 text-blue-500" />
              <h3 className="text-2xl font-bold text-white">Society Organiser</h3>
            </div>
            <p className="text-gray-400 mb-6">Empowering student societies with modern organization tools</p>
            <div className="flex justify-center space-x-4 mb-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
              >
                <Github className="h-6 w-6 text-white" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-700 rounded-full hover:bg-blue-600 transition-colors"
              >
                <Linkedin className="h-6 w-6 text-white" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-700 rounded-full hover:bg-blue-400 transition-colors"
              >
                <Twitter className="h-6 w-6 text-white" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-700 rounded-full hover:bg-pink-600 transition-colors"
              >
                <Instagram className="h-6 w-6 text-white" />
              </a>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <p className="text-gray-500 text-sm">
                © 2024 Society Organiser. All rights reserved. Built with ❤️ for student communities.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default JuniorDashboard;