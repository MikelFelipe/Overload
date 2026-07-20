import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Button } from '@/components/Ui';

test('shared button exposes an accessible action', async () => {
  const onPress = jest.fn();
  const screen = await render(<Button title="Continue" onPress={onPress} />);
  fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
