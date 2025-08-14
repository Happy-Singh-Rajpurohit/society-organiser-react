import React, { useState, useEffect } from 'react';
import { Folder, Code, Megaphone, FileText, Camera, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { Resource } from '../../types';
import CreateResourceModal from './CreateResourceModal';

const ResourcesSection: React.FC = () => {
  const { currentUser } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<'Tech' | 'Marketing' | 'Content' | 'Media'>('Tech');

  const isUserSenior = currentUser?.role && ['EB', 'EC', 'Core'].includes(currentUser.role);

  const departments = [
    { name: 'Tech' as const, icon: Code, color: 'bg-gradient-to-br from-blue-500 to-blue-600', count: 0 },
    { name: 'Marketing' as const, icon: Megaphone, color: 'bg-gradient-to-br from-green-500 to-green-600', count: 0 },
    { name: 'Content' as const, icon: FileText, color: 'bg-gradient-to-br from-purple-500 to-purple-600', count: 0 },
    { name: 'Media' as const, icon: Camera, color: 'bg-gradient-to-br from-orange-500 to-orange-600', count: 0 }
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const resourceList: Resource[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }));
      setResources(resourceList);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const handleCreateResource = (department: 'Tech' | 'Marketing' | 'Content' | 'Media') => {
    setSelectedDepartment(department);
    setShowModal(true);
  };

  const getResourceCount = (department: string) => {
    return resources.filter(resource => resource.department === department).length;
  };

  const getResourcesByDepartment = (department: string) => {
    return resources.filter(resource => resource.department === department);
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteDoc(doc(db, 'resources', resourceId));
        fetchResources();
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center space-x-3 mb-6">
        <Folder className="h-8 w-8 text-green-500" />
        <h2 className="text-3xl font-bold text-white">Resources</h2>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {departments.map(({ name, icon: Icon, color }) => {
          const resourceCount = getResourceCount(name);
          const departmentResources = getResourcesByDepartment(name);
          
          return (
            <div key={name} className="group">
              {isUserSenior ? (
                <button
                  onClick={() => handleCreateResource(name)}
                  className={`w-full ${color} text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <Icon className="h-8 w-8 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg">{name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm opacity-75">{resourceCount} resources</span>
                      <Plus className="h-5 w-5 opacity-75" />
                    </div>
                  </div>
                </button>
              ) : (
                <div className={`w-full ${color} text-white p-6 rounded-xl shadow-lg`}>
                  <div className="flex flex-col items-center space-y-3">
                    <Icon className="h-8 w-8" />
                    <span className="font-bold text-lg">{name}</span>
                    <span className="text-sm opacity-75">{resourceCount} resources</span>
                  </div>
                </div>
              )}
              
              {/* Resources List */}
              {departmentResources.length > 0 && (
                <div className="mt-4">
                  <details className="group">
                    <summary className="cursor-pointer text-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                      <span className="text-white text-sm">View {departmentResources.length} Resources</span>
                    </summary>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {departmentResources.map(resource => (
                        <div key={resource.id} className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium text-sm truncate">{resource.title}</h4>
                              <p className="text-gray-400 text-xs truncate">{resource.description}</p>
                              <p className="text-gray-500 text-xs">By {resource.createdBy}</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                              {isUserSenior && (
                                <button
                                  onClick={() => handleDeleteResource(resource.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isUserSenior && (
        <CreateResourceModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          department={selectedDepartment}
          onResourceCreated={() => {
            fetchResources();
            setShowModal(false);
          }}
        />
      )}
    </section>
  );
};

export default ResourcesSection;