import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Code, Users, Star, Megaphone, Folder, Github, Linkedin, Twitter, Instagram } from 'lucide-react';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Event, Announcement, Resource } from '../../types';
import AnnouncementCard from './AnnouncementCard';
import EventCard from './EventCard';
import CreateEventModal from './CreateEventModal';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import ResourcesSection from './ResourcesSection';

const SeniorDashboard: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<'Workshop' | 'Hackathon' | 'Meet' | 'Event'>('Workshop');

  const eventTypes = [
    { type: 'Workshop' as const, icon: Code, color: 'bg-gradient-to-br from-blue-500 to-blue-600', image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { type: 'Hackathon' as const, icon: Star, color: 'bg-gradient-to-br from-purple-500 to-purple-600', image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { type: 'Meet' as const, icon: Users, color: 'bg-gradient-to-br from-green-500 to-green-600', image: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { type: 'Event' as const, icon: Calendar, color: 'bg-gradient-to-br from-orange-500 to-orange-600', image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ];

  const teamMembers = [
    {
      name: 'Happy Singh Rajpurohit',
      role: 'Frontend + Design + Backend',
      image: 'happy.jpeg',
      social: {
        github: 'https://github.com/Happy-Singh-Rajpurohit',
        linkedin: 'https://www.linkedin.com/in/happy-singh-rajpurohit/',
        instagram: 'https://www.instagram.com/HappyRajpurohit10/'
      }
    },
    {
      name: 'Pulkit Sareen',
      role: 'Frontend + Design + Task Section',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
      social: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        instagram: ''
      }
    },
    {
      name: 'Yuvraj Jasuja',
      role: 'Resource Section',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
      social: {
        github: 'https://github.com/YuvrajJasuja',
        linkedin: 'https://www.linkedin.com/in/yuvraj-jasuja-0b2b04318/',
        instagram: 'https://www.instagram.com/yuvrajjasuja/'
      }
    },
    {
      name: 'Abhishek Chopra',
      role: 'Presentaion Builder',
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
      const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
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

  const handleCreateEvent = (type: 'Workshop' | 'Hackathon' | 'Meet' | 'Event') => {
    setSelectedEventType(type);
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Announcements Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Megaphone className="h-8 w-8 text-blue-500" />
              <h2 className="text-3xl font-bold text-white">Announcements</h2>
            </div>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Announcement</span>
            </button>
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

        {/* Organizing Section */}
        <section className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="h-8 w-8 text-purple-500" />
            <h2 className="text-3xl font-bold text-white">Organizing Section</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {eventTypes.map(({ type, icon: Icon, color, image }) => (
              <div
                key={type}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => handleCreateEvent(type)}
              >
                <div className="absolute inset-0">
                  <img 
                    src={image} 
                    alt={type}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 ${color} opacity-80 group-hover:opacity-90 transition-opacity`}></div>
                </div>
                <div className="relative p-6 text-white">
                  <div className="flex flex-col items-center space-y-3">
                    <Icon className="h-10 w-10 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg">{type}</span>
                    <Plus className="h-6 w-6 opacity-75 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <p className="text-gray-400">Assign and track task progress</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-center">
              <p className="text-gray-400 mb-4">Navigate to the dedicated Task Management section</p>
              <a
                href="/tasks"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Tasks
              </a>
            </div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Event Feedback</h2>
            <p className="text-gray-400">View feedback from members</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-center">
              <p className="text-gray-400 mb-4">Access detailed feedback analytics</p>
              <a
                href="/feedback"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View Feedback
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

        <CreateEventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          eventType={selectedEventType}
          onEventCreated={() => {
            fetchEvents();
            setShowEventModal(false);
          }}
        />

        <CreateAnnouncementModal
          isOpen={showAnnouncementModal}
          onClose={() => setShowAnnouncementModal(false)}
          onAnnouncementCreated={() => {
            fetchAnnouncements();
            setShowAnnouncementModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default SeniorDashboard;