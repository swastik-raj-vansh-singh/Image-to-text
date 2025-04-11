'use client';

import { Box } from '@chakra-ui/react';
import ImageToText from '@/components/ImageToText';

export default function Home() {
  return (
    <Box 
      width="100%" 
      maxWidth="1400px"
      mx="auto"
      py={[4, 6, 8]} 
      px={[2, 4, 6]}
    >
      <ImageToText />
    </Box>
  );
} 