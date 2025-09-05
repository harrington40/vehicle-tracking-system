import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/theme';
import Button from '../ui/Button';

const ProfileEditModal = ({
  visible,
  onClose,
  onSave,
  user,
  managerProfile,
  isManager
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_work: '',
    phone_mobile: '',
    bio: '',
    location: '',
    department: '',
    position: '',
    employee_id: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_work: managerProfile?.profile_data?.phone_work || '',
        phone_mobile: managerProfile?.profile_data?.phone_mobile || '',
        bio: managerProfile?.profile_data?.bio || '',
        location: managerProfile?.profile_data?.location || '',
        department: managerProfile?.profile_data?.department || '',
        position: managerProfile?.profile_data?.position || '',
        employee_id: managerProfile?.profile_data?.employee_id || ''
      });
    }
  }, [user, managerProfile]);

  const handleSave = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Button
            title={saving ? 'Saving...' : 'Save'}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
            textStyle={styles.saveButtonText}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.first_name}
                  onChangeText={(value) => updateField('first_name', value)}
                  placeholder="Enter first name"
                />
              </View>
              
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.last_name}
                  onChangeText={(value) => updateField('last_name', value)}
                  placeholder="Enter last name"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(value) => updateField('bio', value)}
                placeholder="Tell us about yourself..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(value) => updateField('location', value)}
                placeholder="City, State, Country"
              />
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Work Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone_work}
                onChangeText={(value) => updateField('phone_work', value)}
                placeholder="(555) 123-4567"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mobile Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone_mobile}
                onChangeText={(value) => updateField('phone_mobile', value)}
                placeholder="(555) 987-6543"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Work Information (for managers) */}
          {isManager && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Work Information</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Department</Text>
                <TextInput
                  style={styles.input}
                  value={formData.department}
                  onChangeText={(value) => updateField('department', value)}
                  placeholder="Operations, Logistics, etc."
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Position</Text>
                <TextInput
                  style={styles.input}
                  value={formData.position}
                  onChangeText={(value) => updateField('position', value)}
                  placeholder="Fleet Manager, Supervisor, etc."
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Employee ID</Text>
                <TextInput
                  style={styles.input}
                  value={formData.employee_id}
                  onChangeText={(value) => updateField('employee_id', value)}
                  placeholder="EMP001"
                />
              </View>
            </View>
          )}

          {/* Account Information (read-only) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{user?.email}</Text>
                <Ionicons name="lock-closed" size={16} color={COLORS.subtext} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1).replace('_', ' ')}
                </Text>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  readOnlyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  readOnlyText: {
    fontSize: 16,
    color: COLORS.subtext,
  },
});

export default ProfileEditModal;