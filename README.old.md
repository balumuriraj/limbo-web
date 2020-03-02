# Limbo

x = 0; 
l = thisComp.layer("Audio Amplitude").effect("Both Channels")("Slider"); 
y = linear(l, 2, 20, 0, 5);
value+[x, y]