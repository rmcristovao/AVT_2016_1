#include "Explosion.h"
#include <math.h>

using namespace std;

Explosion::Explosion(int _objId, int* addedToId,
	float _x, float _y, float _z,
	float _ivx, float _ivy, float _ivz,
	float _gx, float _gy, float _gz) : DynamicObject(_objId, _x, _y, _z) {
	
	speed = Vec3(_ivx, _ivy, _ivz);
	gravityPoint = Vec3(_gx, _gy, _gz);
	
	memcpy(mesh[objectId].mat.ambient, amb, 4 * sizeof(float));
	memcpy(mesh[objectId].mat.diffuse, diff, 4 * sizeof(float));
	memcpy(mesh[objectId].mat.specular, spec, 4 * sizeof(float));
	memcpy(mesh[objectId].mat.emissive, emissive, 4 * sizeof(float));
	mesh[objectId].mat.shininess = shininess;
	mesh[objectId].mat.texCount = texcount;
	
	createQuad(objectId, 0.5f, 0.5f);
	*addedToId = addToId;

	for (int iplane = 0; iplane < FLARE_PLANES; iplane++) {
		for (int iradius = 0; iradius < FLARE_RADIUSES; iradius++) {
			float sparsityMult = 1.0f;
			if ((iradius % 2) == 0) sparsityMult = 0.5f;
			Vec3 ipos = Vec3(_x, _y, _z);
			float theta = 2.0 * 3.1416f * (float)rand() / RAND_MAX;
			float phi = 3.1416f * (float)rand() / RAND_MAX;
			float vx = INITIALSPEEDMODULUS * cos(theta) * sin(phi);
			float vz = INITIALSPEEDMODULUS * sin(theta) * sin(phi);
			float vy = INITIALSPEEDMODULUS * cos(phi);
			Vec3 ispeed = speed + Vec3(vx, vy, vz)*sparsityMult;
			Vec3 iaccel = gravityPoint - position;
			iaccel = iaccel * (ACCELERATIONMODULUS / sqrt(iaccel.getX()*iaccel.getX() + iaccel.getY()*iaccel.getY() + iaccel.getZ()*iaccel.getZ()));
			positions.push_back(ipos);
			speeds.push_back(ispeed);
			accelerations.push_back(iaccel);
		}
	}
}

Explosion::~Explosion() {
	
}


void Explosion::update(int delta) {
	for(int iflare = 0; iflare < positions.size(); iflare++){
		positions[iflare] = positions[iflare] + speeds[iflare] * (delta / 1000.0f);
		Vec3 iaccel = gravityPoint - positions[iflare];
		iaccel = iaccel * (ACCELERATIONMODULUS / sqrt(iaccel.getX()*iaccel.getX() + iaccel.getY()*iaccel.getY() + iaccel.getZ()*iaccel.getZ()));
		speeds[iflare] = speeds[iflare] + accelerations[iflare] *(delta / 1000.0f);
	}
	lifeLeft -= lifeFade*(delta / 1000.0f);
	if (lifeLeft < 0.0f) lifeLeft = 0.0f;
}


void Explosion::draw(VSShaderLib _shader) {
	glUniform1i(texMode_uniformId, 6);
	mesh[objectId].mat.ambient[3] = lifeLeft;
	float modelview[16];  //To be used in "Cheating" Matrix reset Billboard technique

	for (int iflare = 0; iflare < positions.size(); iflare++) {
		pushMatrix(MODEL);
		mesh[objectId].mat.ambient[3] = lifeLeft;
		GLint loc;
		//CUBE
		// send the material
		loc = glGetUniformLocation(shader.getProgramIndex(), "mat.ambient");
		glUniform4fv(loc, 1, mesh[objectId].mat.ambient);
		loc = glGetUniformLocation(shader.getProgramIndex(), "mat.diffuse");
		glUniform4fv(loc, 1, mesh[objectId].mat.diffuse);
		loc = glGetUniformLocation(shader.getProgramIndex(), "mat.specular");
		glUniform4fv(loc, 1, mesh[objectId].mat.specular);
		loc = glGetUniformLocation(shader.getProgramIndex(), "mat.shininess");
		glUniform1f(loc, mesh[objectId].mat.shininess);
		loc = glGetUniformLocation(shader.getProgramIndex(), "mat.texCount");
		glUniform1i(loc, mesh[objectId].mat.texCount);

		translate(MODEL, positions[iflare].getX(), positions[iflare].getY(), positions[iflare].getZ());
		
		computeDerivedMatrix(VIEW_MODEL);
		memcpy(modelview, mCompMatrix[VIEW_MODEL], sizeof(float) * 16);
		// spherical cheating
		for (int i = 0; i < 3; i++) {
			for (int j = 0; j < 3; j++) {
				if (i == j)
					mCompMatrix[VIEW_MODEL][i * 4 + j] = 1.0;
				else
					mCompMatrix[VIEW_MODEL][i * 4 + j] = 0.0;
			}
		}
		computeDerivedMatrix_PVM();

		// send matrices to OGL
		//computeDerivedMatrix(PROJ_VIEW_MODEL);
		glUniformMatrix4fv(vm_uniformId, 1, GL_FALSE, mCompMatrix[VIEW_MODEL]);
		glUniformMatrix4fv(pvm_uniformId, 1, GL_FALSE, mCompMatrix[PROJ_VIEW_MODEL]);
		computeNormalMatrix3x3();
		glUniformMatrix3fv(normal_uniformId, 1, GL_FALSE, mNormal3x3);
		// Render mesh
		glBindVertexArray(mesh[objectId].vao);
		glDrawElements(mesh[objectId].type, mesh[objectId].numIndexes, GL_UNSIGNED_INT, 0);
		glBindVertexArray(0);

		popMatrix(MODEL);
	}
}

