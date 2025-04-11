'use client';

import { Container, VStack } from '@chakra-ui/react';
import ImageToText from '@/components/ImageToText';

export default function Home() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <ImageToText />
      </VStack>
    </Container>
  );
} 