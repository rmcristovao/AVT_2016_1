
#ifndef BOX_H
#define BOX_H

#include "Vec3.h"

/* Class Box - Class represents "Hit Boxes" */
class Box {

private: double _xMin;

private: double _xMax;

private: double _zMin;

private: double _zMax;


public: Box() {		//Default Values.
	_xMin = -2.0;
	_xMax = 2.0;
	_zMin = -2.0;
	_zMax = 2.0;
}

public: Box(double xMin, double xMax, double zMin, double zMax) {
	_xMin = xMin;
	_xMax = xMax;
	_zMin = zMin;
	_zMax = zMax;
}

public: ~Box() {}

public: double getXMIN() {
	return _xMin;
}
public: double getXMAX() {
	return _xMax;
}
public: double getZMIN() {
	return _zMin;
}
public: double getZMAX() {
	return _zMax;
}

		/* Collided() - Verifies if the boxes intercepts. */
public: static bool Collided(Box box1, Vec3 pos1, Box box2, Vec3 pos2) {
	double otherleft = pos1.getX() + box1.getXMIN();
	double otherright = pos1.getX() + box1.getXMAX();
	double otherbottom = pos1.getZ() + box1.getZMIN();
	double othertop = pos1.getZ() + box1.getZMAX();

	double selfleft = pos2.getX() + box2.getXMIN();
	double selfright = pos2.getX() + box2.getXMAX();
	double selfbottom = pos2.getZ() + box2.getZMIN();
	double selftop = pos2.getZ() + box2.getZMAX();

	if (!(selfleft > otherright || selfright < otherleft || selfbottom > othertop || selftop < otherbottom)) {
		return true;
	}
	else {
		return false;
	}
}

};


#endif