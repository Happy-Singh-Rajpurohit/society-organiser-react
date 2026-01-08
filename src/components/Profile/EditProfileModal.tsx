import React, { useState } from 'react';
import { X, User, Save, ImagePlus } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { uploadToCloudinary } from '../../config/cloudinary';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const { currentUser } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [shortName, setShortName] = useState(currentUser?.shortName || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(currentUser?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoUploadFailed, setPhotoUploadFailed] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setShortName(currentUser.shortName || '');
      setPhotoPreview(currentUser.photoURL || '');
    }
  }, [currentUser]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent, skipPhotoUpload: boolean = false) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setLoading(true);
    setError('');
    setPhotoUploadFailed(false);
    try {
      let photoURL = currentUser.photoURL || '';

      if (photoFile && !skipPhotoUpload) {
        try {
          console.log('Starting photo upload to Cloudinary...');
          console.log('Uploading file...');
          photoURL = await uploadToCloudinary(photoFile);
          console.log('Photo uploaded successfully:', photoURL);
        } catch (uploadError: any) {
          console.error('Error uploading photo:', uploadError);
          const errorMessage = uploadError?.message || 'Failed to upload photo';
          setError(`Photo upload failed: ${errorMessage}`);
          setLoading(false);
          setPhotoUploadFailed(true);
          return;
        }
      }

      console.log('Updating profile in Firestore...');
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: name.trim(),
        shortName: shortName.trim() || null,
        photoURL: photoURL || null,
        updatedAt: new Date()
      });

      console.log('Profile updated successfully');
      setLoading(false);
      onClose();
      await new Promise(resolve => setTimeout(resolve, 300));
      await onProfileUpdated();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error?.message || 'Failed to update profile';
      setError(`Error: ${errorMessage}`);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-500">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
              )}
              <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition-colors">
                <ImagePlus className="h-5 w-5" />
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-400 text-center">Click the camera icon to upload a photo (max 5MB)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email (Cannot be changed)
            </label>
            <input
              type="email"
              value={currentUser?.email || ''}
              disabled
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg
                         text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                         text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Short Name (Optional)
            </label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                         text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., John D."
            />
            <p className="text-xs text-gray-400 mt-1">
              A shorter version of your name for display purposes
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role (Cannot be changed)
            </label>
            <input
              type="text"
              value={currentUser?.role || ''}
              disabled
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg
                         text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg
                           hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => handleSubmit(e as any, false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                           transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
            {photoUploadFailed && photoFile && (
              <button
                onClick={(e) => handleSubmit(e as any, true)}
                disabled={loading}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700
                           transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? 'Saving...' : 'Save Without Photo'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
