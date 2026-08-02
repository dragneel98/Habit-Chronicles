import React from 'react';
import { render } from '@testing-library/react-native';
import ProgressBar from '../ProgressBar';

describe('components/ProgressBar.jsx', () => {
  test('renderiza correctamente sin romper la app', () => {
    const { UNSAFE_getByType } = render(<ProgressBar percent={50} color="#FF9F43" height={10} />);
    expect(UNSAFE_getByType(ProgressBar)).toBeTruthy();
  });
});
